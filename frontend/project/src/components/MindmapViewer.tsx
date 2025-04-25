import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { NeonBorder } from './NeonBorder';
import { useNavigate } from 'react-router-dom';

interface Mindmap {
  title: string;
  code: string;
}

interface MindmapViewerProps {
  mindmaps: Mindmap[];
  processingTime?: number;
}

interface ZoomState {
  scale: number;
  mindmapId: string;
}

export const MindmapViewer: React.FC<MindmapViewerProps> = ({ mindmaps, processingTime }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [zoomStates, setZoomStates] = React.useState<{ [key: string]: ZoomState }>({});

  useEffect(() => {
    // Configure mermaid with theme that matches the site
    mermaid.initialize({
      startOnLoad: true,
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
      mindmap: {
        useMaxWidth: false,
        padding: 20
      },
      themeVariables: {
        // Customize colors to match your site's palette
        primaryColor: '#7c3aed', // Purple (matches your primary button color)
        primaryTextColor: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
        primaryBorderColor: '#7c3aed',
        lineColor: '#7c3aed',
        fontSize: '16px'
      }
    });

    // Render mindmaps with a delay to prevent rendering issues
    if (mindmaps.length > 0 && containerRef.current) {
      // Create unique IDs for each mindmap
      const mindmapElements = containerRef.current.querySelectorAll('.mindmap-diagram');
     
      mindmapElements.forEach((element, index) => {
        setTimeout(() => {
          try {
            mermaid.render(`mindmap-${index}`, mindmaps[index].code)
              .then(result => {
                element.innerHTML = result.svg;
               
                // Add some extra styling to the SVG elements
                const svg = element.querySelector('svg');
                if (svg) {
                  svg.style.width = '100%';
                  svg.style.maxWidth = '100%';
                  svg.style.borderRadius = '0.5rem';
                  svg.style.transform = `scale(${zoomStates[`mindmap-${index}`]?.scale || 1})`;
                  svg.style.transformOrigin = 'center';
                  svg.style.transition = 'transform 0.3s ease';
                 
                  // Find all text elements and style them
                  const textElements = svg.querySelectorAll('text');
                  textElements.forEach(text => {
                    text.style.fontFamily = 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
                    text.style.fontSize = '14px';
                  });
                 
                  // Style the nodes
                  const nodes = svg.querySelectorAll('.node');
                  nodes.forEach(node => {
                    const rect = node.querySelector('rect, circle, ellipse');
                    if (rect) {
                      rect.setAttribute('rx', '8'); // Rounded corners
                      rect.setAttribute('ry', '8');
                    }
                  });
                }
              })
              .catch(error => {
                console.error('Mermaid rendering error:', error);
                element.innerHTML = `
                  <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <h3 class="text-red-600 dark:text-red-400 font-medium">Rendering Error</h3>
                    <pre class="mt-2 text-sm text-red-800 dark:text-red-300 overflow-auto">${error.message}</pre>
                  </div>`;
              });
          } catch (e) {
            console.error('Mermaid general error:', e);
          }
        }, index * 300); // Stagger rendering
      });
    }
  }, [mindmaps]);

  const handleStartStudyStreak = () => {
    // Store mindmaps in session storage for the streaks page
    sessionStorage.setItem('current_mindmaps', JSON.stringify(mindmaps));
    navigate('/study-streaks');
  };

  if (!mindmaps || mindmaps.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-black border border-black/10 dark:border-white/20 rounded-3xl">
        <p className="text-gray-600 dark:text-gray-400">No mindmaps available</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-8">
      {processingTime && (
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Generated in {processingTime.toFixed(2)} seconds
          </p>
        </div>
      )}
      
      {mindmaps.map((mindmap, index) => (
        <div key={index} className="relative bg-white dark:bg-black border border-black/10 dark:border-white/20 rounded-3xl p-6 shadow-lg">
          <NeonBorder />
         
          <h3 className="text-2xl font-bold text-black dark:text-white mb-6">
            {mindmap.title}
          </h3>
         
          <div className="flex justify-end gap-2 mb-4">
            <button
              onClick={() => {
                const svg = containerRef.current?.querySelector(`#mindmap-${index} svg`);
                if (svg) {
                  const svgData = new XMLSerializer().serializeToString(svg);
                  const blob = new Blob([svgData], { type: 'image/svg+xml' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${mindmap.title.replace(/\s+/g, '_')}_mindmap.svg`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download SVG
            </button>
            <div className="flex items-center gap-2 bg-white/50 dark:bg-black/50 rounded-lg px-3">
              <button
                onClick={() => {
                  const currentScale = zoomStates[`mindmap-${index}`]?.scale || 1;
                  setZoomStates(prev => ({
                    ...prev,
                    [`mindmap-${index}`]: { scale: Math.max(0.5, currentScale - 0.1), mindmapId: `mindmap-${index}` }
                  }));
                }}
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round((zoomStates[`mindmap-${index}`]?.scale || 1) * 100)}%
              </span>
              <button
                onClick={() => {
                  const currentScale = zoomStates[`mindmap-${index}`]?.scale || 1;
                  setZoomStates(prev => ({
                    ...prev,
                    [`mindmap-${index}`]: { scale: Math.min(2, currentScale + 0.1), mindmapId: `mindmap-${index}` }
                  }));
                }}
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
          <div
            className="mindmap-diagram bg-white/50 dark:bg-black/50 rounded-xl p-2"
            style={{ height: '400px', overflow: 'auto' }}
          >
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
            </div>
          </div>
        </div>
      ))}

      {mindmaps.length > 0 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleStartStudyStreak}
            className="group relative inline-flex items-center justify-center px-8 py-3 font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full overflow-hidden transform transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out"></span>
            <span className="relative flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Study Streak
            </span>
          </button>
        </div>
      )}
    </div>
  );
};