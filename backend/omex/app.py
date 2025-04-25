# app.py (Modified for Backend-Only File Handling)

import logging
from flask import Flask, request, jsonify, session, redirect, url_for, flash, render_template
from flask_cors import CORS
import json
import sqlite3
import os
import time
from werkzeug.utils import secure_filename
from functools import wraps
# Make sure streaks is imported correctly after the refactor
from streaks import generate_study_plan_and_quizzes
# Assuming mindmaps functions are still needed elsewhere or potentially for initial generation
from mindmaps import extract_text, clean_text, generate_mindmaps, process_mindmaps
from openai import OpenAI # Keep if used elsewhere, otherwise remove if only streaks uses OpenAI

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["*"]) # Allow all origins for simplicity, restrict in production
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'pdf'}
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
# Increase Flask's request timeout if the single streaks API call might exceed 30s
# app.config['REQUEST_TIMEOUT'] = 150 # Example: 150 seconds
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key')

# Create uploads directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# --- Error Handling ---
def handle_exceptions(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            logger.error(f"Error in {f.__name__}: {str(e)}", exc_info=True)
            # Check if the request expects JSON
            if request.accept_mimetypes.accept_json and not request.accept_mimetypes.accept_html:
                return jsonify({'error': 'An unexpected server error occurred', 'details': str(e)}), 500
            # Otherwise, assume HTML response is acceptable or default
            flash(f'An unexpected error occurred: {str(e)}')
            # Redirect to a sensible default page, maybe home or upload
            # If mindmaps_upload is only for POST, redirect elsewhere like a home page
            # return redirect(url_for('mindmaps_upload')) # Original redirect
            # Make sure 'some_default_error_page_or_home' route exists or change this
            return redirect(url_for('some_default_error_page_or_home'))
    return decorated_function

# --- Database Setup ---
def init_db():
    # Use context manager for database connection
    try:
        with sqlite3.connect('study_plan.db') as conn:
            c = conn.cursor()
            # Study Plans Table
            c.execute('''
                CREATE TABLE IF NOT EXISTS study_plans (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    filename TEXT, -- Store the filename for reference
                    mindmap_data TEXT, -- Store original mindmaps used
                    study_plan_data TEXT, -- Store the generated plan/quizzes
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            ''')
            # User Tokens Table
            c.execute('''
                CREATE TABLE IF NOT EXISTS user_tokens (
                    user_id INTEGER PRIMARY KEY,
                    tokens INTEGER DEFAULT 0
                );
            ''')
            # Example: Add a default user if needed for testing
            c.execute('INSERT OR IGNORE INTO user_tokens (user_id, tokens) VALUES (?, ?)', (1, 0))
            conn.commit() # Commit changes
            logger.info("Database initialized/checked successfully.")
    except sqlite3.Error as e:
        logger.error(f"Database initialization error: {e}", exc_info=True)
        # Depending on severity, you might want to exit or handle differently
        raise # Reraise the exception if initialization is critical

init_db() # Initialize DB when the app starts

def get_db_connection():
    """Creates a database connection."""
    try:
        conn = sqlite3.connect('study_plan.db')
        conn.row_factory = sqlite3.Row # Return rows as dictionary-like objects
        return conn
    except sqlite3.Error as e:
        logger.error(f"Database connection error: {e}", exc_info=True)
        return None # Return None or raise an exception

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# --- Routes ---

# Example placeholder route for redirection
@app.route('/')
def some_default_error_page_or_home():
    # Replace with a proper template rendering if this is a user-facing page
    return "Welcome! Please upload a PDF to start generating mindmaps and study plans."

# --- Mindmap Routes ---
@app.route('/api/mindmap/upload', methods=['POST'])
@handle_exceptions
def mindmap_upload():
    if 'file' not in request.files:
        logger.warning("Mindmap upload attempt with no file part.")
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        logger.warning("Mindmap upload attempt with no selected file.")
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        start_time = time.time()
        # Sanitize filename
        filename = secure_filename(file.filename)
        # Ensure unique filenames, using timestamp prefix
        unique_filename = f"{int(time.time())}_{filename}"
        pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)

        try:
            file.save(pdf_path)
            logger.info(f"File saved to {pdf_path}")

            # Process PDF to generate mindmaps
            # We extract text here to generate mindmaps, but will extract again for quizzes
            text_for_mindmaps = extract_text(pdf_path) # From mindmaps.py
            cleaned_text_for_mindmaps = clean_text(text_for_mindmaps) # From mindmaps.py
            logger.info(f"Extracted text for mindmap generation from {unique_filename} (length: {len(cleaned_text_for_mindmaps)})")

            # Generate and process mindmaps using mindmaps.py functions
            ai_output = generate_mindmaps(cleaned_text_for_mindmaps) # From mindmaps.py
            if ai_output is None:
                 logger.error("Mindmap generation returned None.")
                 # Delete the file if mindmap generation fails
                 if os.path.exists(pdf_path):
                     os.remove(pdf_path)
                     logger.info(f"Removed temporary file {pdf_path} after mindmap generation failure.")
                 return jsonify({'error': 'Failed to generate mindmaps from AI. Check AI service logs or connection.'}), 500

            mindmaps = process_mindmaps(ai_output) # From mindmaps.py
            logger.info(f"Processed {len(mindmaps)} mindmaps for {unique_filename}")

            end_time = time.time()
            print(mindmaps)
            # Return the generated mindmaps ONLY
            # The PDF file is KEPT in the uploads folder
            return jsonify({
                'mindmaps': mindmaps,
                'processing_time': round(end_time - start_time, 2)
            })

        except ValueError as ve: # Catch specific errors like empty PDF
             logger.error(f"Value error processing file {unique_filename}: {str(ve)}", exc_info=True)
             # Delete the file on processing error
             if os.path.exists(pdf_path):
                 os.remove(pdf_path)
                 logger.info(f"Removed temporary file {pdf_path} after value error.")
             return jsonify({'error': f'Error processing file: {str(ve)}'}), 400
        except Exception as e: # Catch other potential errors
            logger.error(f"Unexpected error processing file {unique_filename}: {str(e)}", exc_info=True)
            # Delete the file on unexpected error
            if os.path.exists(pdf_path):
                 os.remove(pdf_path)
                 logger.info(f"Removed temporary file {pdf_path} after unexpected error.")
            return jsonify({'error': f'An unexpected error occurred while processing the file.'}), 500
        # Removed the finally block that deletes the file


    else:
        logger.warning(f"Mindmap upload attempt with invalid file type: {file.filename}")
        return jsonify({'error': 'Invalid file type. Please upload a PDF file.'}), 400


# --- Streaks Routes ---

@app.route('/api/streaks/initialize', methods=['POST'])
@handle_exceptions
def api_initialize_study():
    """
    API endpoint for initializing study plan.
    Expects JSON body like: {"mindmaps": [ { "title": "t1", "code": "c1" }, ... ]}
    Finds the most recent PDF file in the uploads folder to extract text.
    """
    logger.info("Received request to initialize streaks study plan.")

    # --- Get and Parse Input ---
    mindmap_data_raw = request.get_data(as_text=True)
    logger.debug(f"Raw request body: {mindmap_data_raw[:200]}...")  # Log beginning of raw data

    parsed_data = None
    try:
        # Try parsing JSON with force=False first (safer)
        parsed_data = request.get_json()

        if parsed_data is None and mindmap_data_raw:
            # If get_json returns None but raw data exists, try manual parse
            logger.warning("request.get_json() returned None, attempting manual parse.")
            try:
                parsed_data = json.loads(mindmap_data_raw)
            except json.JSONDecodeError as manual_parse_error:
                logger.error(f"Manual JSON parsing failed: {manual_parse_error}")
                return jsonify({'error': 'Invalid JSON data received in request body.'}), 400
        elif parsed_data is None:
            logger.error("No JSON data received in request.")
            return jsonify({'error': 'No JSON data found in request body.'}), 400

    except Exception as json_parse_error:  # Catch potential errors during get_json itself
        logger.error(f"Failed to parse incoming JSON: {json_parse_error}")
        return jsonify({'error': 'Invalid JSON data received in request body.'}), 400

    logger.info(f"Parsed request data type: {type(parsed_data)}")

    # --- Extract the list of mindmaps ---
    mindmap_list = None

    if isinstance(parsed_data, dict) and 'mindmaps' in parsed_data:
        mindmap_list = parsed_data.get('mindmaps')
        # Filename is NOT expected in the body anymore
        logger.info(f"Extracted 'mindmaps' list from the input dictionary. Found {len(mindmap_list) if mindmap_list else 0} items.")
    elif isinstance(parsed_data, list):
        # Allow receiving the list directly as well
        mindmap_list = parsed_data
        logger.info(f"Received mindmap data directly as a list. Found {len(mindmap_list) if mindmap_list else 0} items.")
    else:
        logger.error(
            f"Unexpected JSON structure. Expected a dict with 'mindmaps' key or a list. Received type: {type(parsed_data)}")
        return jsonify({'error': 'Invalid JSON structure. Expected {"mindmaps": [...]}.'}), 400

    # Basic validation
    if not mindmap_list:
        logger.error("Mindmap list is empty or was not provided correctly.")
        return jsonify({'error': 'No mindmap data provided or list is empty.'}), 400
    if not isinstance(mindmap_list, list):
         logger.error(f"Mindmap data is not a list after extraction, it's type: {type(mindmap_list)}.")
         return jsonify({'error': 'Invalid mindmap data format after extraction.'}), 500


    # Enhanced validation for mindmap items (already modified in previous turn)
    valid_items = []
    invalid_items = []

    for i, item in enumerate(mindmap_list):
        if isinstance(item, dict) and 'title' in item and 'content' in item:
            valid_items.append(item)
        else:
            # Log the invalid item's structure
            item_type = type(item).__name__
            item_keys = list(item.keys()) if isinstance(item, dict) else "N/A"
            logger.error(f"Invalid mindmap at index {i}: type={item_type}, keys={item_keys}")
            invalid_items.append(i)  # Just store the index

    if invalid_items:
        logger.error(f"Found {len(invalid_items)} invalid mindmap items at indices: {invalid_items}")
        # We could return an error here, but let's try to proceed with valid items if possible
        if not valid_items:
            # If no valid items, return error
            return jsonify({'error': 'All mindmap items were invalid. Please check data format.'}), 400
        logger.warning(
            f"Proceeding with {len(valid_items)} valid mindmap items and ignoring {len(invalid_items)} invalid ones.")
        mindmap_list = valid_items

    logger.info(f"Validated mindmap list contains {len(mindmap_list)} valid items.")

    # --- Find the Most Recent PDF in Uploads Folder ---
    upload_folder = app.config['UPLOAD_FOLDER']
    pdf_files = [f for f in os.listdir(upload_folder) if f.endswith('.pdf')]

    if not pdf_files:
        logger.error(f"No PDF files found in the uploads folder: {upload_folder}")
        return jsonify({'error': 'No PDF file found on the server to generate study plan text from. Please upload a PDF first.'}), 404

    # Sort files by modification time (most recent first)
    pdf_files.sort(key=lambda x: os.path.getmtime(os.path.join(upload_folder, x)), reverse=True)

    # Assume the most recent file is the one associated with these mindmaps
    latest_pdf_filename = pdf_files[0]
    pdf_path_to_extract = os.path.join(upload_folder, latest_pdf_filename)
    logger.info(f"Assuming the latest PDF '{latest_pdf_filename}' is associated with this request.")

    # Store the filename to be saved in the DB later
    filename_to_store = latest_pdf_filename # Use the name of the found file

    # --- Extract Text from the Found PDF ---
    cleaned_text = None
    try:
        text_from_pdf = extract_text(pdf_path_to_extract) # Extract text
        cleaned_text = clean_text(text_from_pdf) # Clean text
        logger.info(f"Extracted and cleaned text from '{latest_pdf_filename}' for study plan generation (length: {len(cleaned_text)})")
    except Exception as e:
        logger.error(f"Error extracting text from '{latest_pdf_filename}' for study plan: {e}", exc_info=True)
        # If text extraction fails, delete the file and return error
        if os.path.exists(pdf_path_to_extract):
            os.remove(pdf_path_to_extract)
            logger.info(f"Removed temporary file {pdf_path_to_extract} after text extraction error.")
        return jsonify({'error': f'Error extracting text from PDF for study plan: {str(e)}'}), 500


    # --- Generate Study Plan ---
    study_data = None  # Initialize study_data
    try:
        # Call the refactored function from streaks.py with the extracted list AND the newly extracted text
        study_data = generate_study_plan_and_quizzes(mindmap_list, cleaned_text) # Pass cleaned_text
        logger.info("Successfully generated study plan and quizzes.")

    except ConnectionError as ce:
        logger.error(f"API connection error during study plan generation: {ce}")
        # On API error, delete the file
        if os.path.exists(pdf_path_to_extract):
            os.remove(pdf_path_to_extract)
            logger.info(f"Removed temporary file {pdf_path_to_extract} after API connection error.")
        return jsonify({'error': 'Failed to connect to AI service for study plan generation.',
                        'details': str(ce)}), 503  # Service Unavailable
    except ValueError as ve:
        logger.error(f"Value error during study plan generation: {ve}")
        # On Value error, delete the file
        if os.path.exists(pdf_path_to_extract):
            os.remove(pdf_path_to_extract)
            logger.info(f"Removed temporary file {pdf_path_to_extract} after value error during generation.")
        return jsonify({'error': 'Invalid data encountered during study plan generation.', 'details': str(ve)}), 400
    except Exception as e:
        # Catch-all for other errors during generation
        logger.error(f"Failed to generate study plan: {str(e)}")
        # On other generation errors, delete the file
        if os.path.exists(pdf_path_to_extract):
            os.remove(pdf_path_to_extract)
            logger.info(f"Removed temporary file {pdf_path_to_extract} after generation error.")
        return jsonify({'error': 'Failed to generate study plan due to an internal error.', 'details': str(e)}), 500

    # --- Validate Study Plan Output ---
    if not study_data or 'study_plan' not in study_data or not isinstance(study_data.get('study_plan'), list):
        logger.error(
            f"Invalid study plan format returned by generation function. Type: {type(study_data)}, Content: {str(study_data)[:200]}...")
        # Check if it's a fallback structure from streaks.py
        if isinstance(study_data, dict) and study_data.get("study_plan") == []:
            logger.warning("Generation function returned an empty study plan (possibly fallback).")
             # Even if fallback, delete the file
            if os.path.exists(pdf_path_to_extract):
                os.remove(pdf_path_to_extract)
                logger.info(f"Removed temporary file {pdf_path_to_extract} after fallback study plan.")
        else:
            # If invalid structure, delete the file
            if os.path.exists(pdf_path_to_extract):
                os.remove(pdf_path_to_extract)
                logger.info(f"Removed temporary file {pdf_path_to_extract} after invalid study plan structure.")
            return jsonify({'error': 'Internal error: Invalid study plan format generated by AI service.'}), 500

    # --- Store and Respond ---
    conn = None  # Initialize conn
    try:
        conn = get_db_connection()
        if not conn:  # Handle connection failure
             # Still attempt to delete the file even if DB connection fails
             if os.path.exists(pdf_path_to_extract):
                os.remove(pdf_path_to_extract)
                logger.info(f"Removed temporary file {pdf_path_to_extract} after DB connection failure.")
             return jsonify({'error': 'Database connection failed.'}), 500

        cursor = conn.cursor()

        # Store the generated plan and the input mindmaps, using the determined filename
        cursor.execute(
            'INSERT INTO study_plans (user_id, filename, mindmap_data, study_plan_data) VALUES (?, ?, ?, ?)',
            (
                session.get('user_id', 1),  # Default user ID 1 for demo/testing
                filename_to_store,  # Store the determined filename
                json.dumps(mindmap_list),  # Store the input mindmaps list
                json.dumps(study_data)  # Store the generated plan dict
            )
        )
        study_plan_id = cursor.lastrowid  # Get the ID of the inserted row
        conn.commit()
        logger.info(f"Stored study plan in DB with ID: {study_plan_id} using filename: {filename_to_store}")

        # Get user tokens
        user_id = session.get('user_id', 1)
        tokens_data = cursor.execute(
            'SELECT tokens FROM user_tokens WHERE user_id = ?', (user_id,)
        ).fetchone()

        # Set up session variables for tracking progress
        session['study_plan_id'] = study_plan_id
        session['quiz_progress'] = {'completed': {}, 'scores': {}}
        session.modified = True

        # Add tokens and ID to the response
        study_data['tokens'] = tokens_data['tokens'] if tokens_data else 0
        study_data['study_plan_id'] = study_plan_id

        logger.info(f"Returning generated study plan (ID: {study_plan_id}) to client.")

        # **Delete the temporary PDF file after successful DB storage**
        if os.path.exists(pdf_path_to_extract):
            try:
                os.remove(pdf_path_to_extract)
                logger.info(f"Removed temporary file {pdf_path_to_extract}")
            except OSError as e:
                logger.error(f"Error removing temporary file {pdf_path_to_extract}: {e}")

        return jsonify(study_data)

    except sqlite3.Error as db_error:
        logger.error(f"Database error during study plan storage: {str(db_error)}")
        if conn:
            conn.rollback()
        # **Attempt to delete the file on DB error**
        if os.path.exists(pdf_path_to_extract):
            try:
                os.remove(pdf_path_to_extract)
                logger.info(f"Removed temporary file {pdf_path_to_extract} after DB error.")
            except OSError as e_del:
                logger.error(f"Error removing temporary file {pdf_path_to_extract} after DB error: {e_del}")

        return jsonify({'error': 'Database error occurred while saving study plan.'}), 500
    except Exception as e:
         logger.error(f"Unexpected error during streaks initialization: {e}", exc_info=True)
         # **Attempt to delete the file on other errors**
         if os.path.exists(pdf_path_to_extract):
            try:
                os.remove(pdf_path_to_extract)
                logger.info(f"Removed temporary file {pdf_path_to_extract} after unexpected error.")
            except OSError as e_del:
                logger.error(f"Error removing temporary file {pdf_path_to_extract} after unexpected error: {e_del}")

         return jsonify({'error': f'An unexpected error occurred during initialization: {str(e)}'}), 500

    finally:
        if conn:
            conn.close()


# --- Other Routes (Placeholder - Adapt as needed) ---
# These routes likely need adjustment depending on how the frontend uses the study_plan_id

@app.route('/api/streaks/plan/<int:plan_id>', methods=['GET'])
@handle_exceptions
def get_study_plan(plan_id):
    """API endpoint to fetch a specific study plan by ID."""
    conn = None
    try:
        conn = get_db_connection()
        if not conn: return jsonify({'error': 'Database connection failed.'}), 500

        study_plan_record = conn.execute(
            'SELECT study_plan_data FROM study_plans WHERE id = ?', (plan_id,)
        ).fetchone()

        if not study_plan_record:
            return jsonify({'error': 'Study plan not found'}), 404

        study_plan_data = json.loads(study_plan_record['study_plan_data'])

        # Optionally add user tokens or progress if needed
        user_id = session.get('user_id', 1) # Adjust user ID logic
        tokens_data = conn.execute(
            'SELECT tokens FROM user_tokens WHERE user_id = ?', (user_id,)
        ).fetchone()
        study_plan_data['tokens'] = tokens_data['tokens'] if tokens_data else 0
        # Add session progress if relevant for this view
        # study_plan_data['quiz_progress'] = session.get('quiz_progress', {})

        return jsonify(study_plan_data)

    except sqlite3.Error as db_error:
        logger.error(f"Database error fetching study plan {plan_id}: {db_error}", exc_info=True)
        return jsonify({'error': 'Database error retrieving study plan.'}), 500
    finally:
        if conn:
            conn.close()


@app.route('/api/streaks/submit-quiz/<int:plan_id>/<int:topic_index>/<int:subtopic_index>', methods=['POST'])
@handle_exceptions
def submit_quiz_api(plan_id, topic_index, subtopic_index):
    """API endpoint to process quiz submission."""
    conn = None
    try:
        conn = get_db_connection()
        if not conn: return jsonify({'error': 'Database connection failed.'}), 500

        # Fetch the specific study plan
        study_plan_record = conn.execute(
            'SELECT study_plan_data FROM study_plans WHERE id = ?', (plan_id,)
        ).fetchone()

        if not study_plan_record:
             return jsonify({'error': 'Study plan not found'}), 404

        study_plan_full = json.loads(study_plan_record['study_plan_data'])
        study_plan_list = study_plan_full.get('study_plan', [])

        # Validate indices and find the correct quiz
        if not (0 <= topic_index < len(study_plan_list)):
             return jsonify({'error': 'Topic index out of bounds.'}), 400
        topic = study_plan_list[topic_index]
        subtopics = topic.get('subtopics', [])
        if not (0 <= subtopic_index < len(subtopics)):
             return jsonify({'error': 'Subtopic index out of bounds.'}), 400

        subtopic = subtopics[subtopic_index]
        questions = subtopic.get('quiz', [])

        if not questions:
             logger.warning(f"No quiz questions found for plan {plan_id}, topic {topic_index}, subtopic {subtopic_index}")
             return jsonify({'error': 'No quiz questions found for this subtopic.'}), 404

        # Get submitted answers (assuming JSON body like {"answers": {"0": "A", "1": "C", ...}})
        submission_data = request.get_json()
        if not submission_data or 'answers' not in submission_data or not isinstance(submission_data['answers'], dict):
             logger.error(f"Invalid quiz submission format: {submission_data}")
             return jsonify({'error': 'Invalid submission format. Expected {"answers": { ... }}.'}), 400
        user_answers = submission_data['answers']

        # Calculate score
        score = 0
        total = len(questions)
        results = [] # Store individual results if needed
        for i, q in enumerate(questions):
            question_index_str = str(i) # Answers dict uses string keys
            submitted_answer = user_answers.get(question_index_str)
            correct_answer = q.get('answer') # Assumes 'answer' key holds 'A', 'B', etc.
            is_correct = False
            # Ensure correct_answer is a string before stripping/upping
            if submitted_answer and correct_answer and isinstance(correct_answer, str) and submitted_answer.strip().upper() == correct_answer.strip().upper():
                score += 1
                is_correct = True
            results.append({
                 "question_index": i,
                 "submitted": submitted_answer,
                 "correct_answer": correct_answer,
                 "is_correct": is_correct
            })


        percentage = round((score / total * 100), 1) if total > 0 else 0.0
        passed = percentage >= 70.0 # Example passing threshold

        # Calculate tokens (adjust logic as needed)
        tokens_earned = 0
        if passed:
            tokens_earned = 20 if score == total else 10

        # Update tokens in database if earned
        if tokens_earned > 0:
            user_id = session.get('user_id', 1) # Get user ID
            cursor = conn.cursor()
            # Use INSERT ... ON CONFLICT for atomic update/insert
            cursor.execute(
                'INSERT INTO user_tokens (user_id, tokens) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET tokens = tokens + excluded.tokens',
                (user_id, tokens_earned)
            )
            conn.commit()
            logger.info(f"User {user_id} earned {tokens_earned} tokens for quiz on plan {plan_id}, topic {topic_index}, subtopic {subtopic_index}.")


        # Update session progress (if using sessions)
        progress_key = f"{topic_index}_{subtopic_index}"
        if 'quiz_progress' not in session:
             session['quiz_progress'] = {'completed': {}, 'scores': {}}
        # Store more detailed score info if needed
        session['quiz_progress']['completed'][progress_key] = True
        session['quiz_progress']['scores'][progress_key] = {
            'score': score,
            'total': total,
            'percentage': percentage,
            'tokens': tokens_earned,
            'passed': passed
            # 'timestamp': time.time() # Optional timestamp
        }
        session.modified = True

        # Return results
        return jsonify({
            'message': 'Quiz submitted successfully!',
            'score': score,
            'total': total,
            'percentage': percentage,
            'passed': passed,
            'tokens_earned': tokens_earned,
            'topic_name': topic.get('topic', ''),
            'subtopic_name': subtopic.get('name', ''),
            'results': results # Optionally return detailed results
        })

    except sqlite3.Error as db_error:
        logger.error(f"Database error during quiz submission for plan {plan_id}: {db_error}", exc_info=True)
        if conn: conn.rollback()
        return jsonify({'error': 'Database error processing quiz submission.'}), 500
    except Exception as e:
         logger.error(f"Error submitting quiz for plan {plan_id}: {e}", exc_info=True)
         return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500
    finally:
        if conn:
            conn.close()


# --- Main Execution ---
if __name__ == '__main__':
    # Use debug=False in production for security and performance
    # Use host='0.0.0.0' to make it accessible on your local network
    # Consider using a production-ready WSGI server like Gunicorn or Waitress instead of app.run for deployment
    print("Starting Flask server...")
    app.run(debug=True, host='0.0.0.0', port=5000) # Example port, change if needed

