import os
from azure.ai.inference import ChatCompletionsClient
from azure.core.credentials import AzureKeyCredential
from azure.ai.inference.models import SystemMessage, UserMessage
import subprocess
import time
from dotenv import load_dotenv
import streamlit as st
import re
from collections import defaultdict

load_dotenv()

# Load the enviroment variables
endpoint = os.getenv("AZURE_DEEPSEEK_ENDPOINT")
api_key = os.getenv("AZURE_DEEPSEEK_API")
deployment = "DeepSeek-V3-0324-slesj"

# Intialize the client with credentials
client = ChatCompletionsClient(
    endpoint=endpoint,
    credential=AzureKeyCredential(api_key)
)

# Build the angular project to check for errors
def run_angular_build(project_path):
    if not os.path.isdir(project_path):
        st.error(f"Error: The provided path does not exist or is not a directory.\nPath: {project_path}")
        return

    original_cwd = os.getcwd()
    script_dir = os.path.dirname(os.path.abspath(__file__))
    log_file_path = os.path.join(script_dir, "angular_build_errors.txt")

    os.chdir(project_path)

    try:
        result = subprocess.run(
            "ng build",  # Run as a string when shell=True
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            encoding="utf-8",
            text=True,
            shell=True  # Use shell so it can find 'ng'
        )

        if result.returncode != 0:
            with open(log_file_path, "w", encoding="utf-8") as f:
                f.write("Angular Build Failed:\n")
                f.write(result.stderr)
            st.warning(f"Build failed. Errors saved to: {log_file_path}")
            return log_file_path 
        else:
            print("Angular build completed successfully.")
            exit

    except Exception as e:
        print(f"Unexpected error: {e}")
    
    finally:
        os.chdir(original_cwd )

# Give the filenames having errors
def get_error_filenames(error_log,target_filename):

    relevant_errors = error_log[target_filename]

    # Prepare prompt for GPT
    prompt = f"""Below is a list of build-time errors generated.
                Summarize the errors, explain them and Suggest the fixes for the errors.
                Suggest the compatible versions for the missing packages                    
                Do not include any code snippets, or extra text.

                ### Error:
                {relevant_errors}
                """

    # Connect to GPT
    response = client.complete(
        messages=[
            SystemMessage(content="You are an Angular code fixer assisting in migrating code from Angular 5 to Angular 19"),
            UserMessage(content=prompt),
        ],
        model=deployment,
        temperature=0.3,
        max_tokens=10000,
        top_p=1.0
    )

    # Extract content 
    gpt_reply = response.choices[0].message.content
    return gpt_reply,relevant_errors

# Upates the corrected code
def write_corrected_code(error_lines,filepath):

    # Load the file having code with errors
    with open(filepath, "r", encoding="utf-8") as f:
        code = f.read()

        # Prepare prompt for GPT
        prompt = f"""Original code:
                    {code}

                    Error:
                    {error_lines}
                    """
        
        # Connect to GPT
        response = client.complete(
            messages=[
                SystemMessage(content = """You are an Angular code fixer assisting in migrating code from Angular 5 to Angular 19
                              Instructions:
                              You will be provided with the full content of a single Angular file, its file type (.ts, .html, or .css),
                              and a list of errors relevant only to that file.
                              Your task is to fix only the errors pertaining to this file. and ensure the code is compatible with Angular 19.
                              Return the full corrected code as a single complete file — do not truncate or skip any part of the code.
                              Do not include explanations, comments, or code fences.
                              Your response must contain all lines, even if unchanged. 
                              Use appropriate **inline comments starting with AI changed** (e.g., `//`, `<!-- -->`, or `/* */`) to explain the all changes made.
                              If any missing files or paths, convert that line or import as a comment
                              Do not add any quotes or code type in the beginning or end
                              Do not remove the existing comments"""),
                UserMessage(content=prompt),
            ],
            model=deployment,
            temperature=0.3,
            max_tokens=10000,
            top_p=1.0
        )

        # Extract content
        gpt_code = response.choices[0].message.content
        

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(gpt_code)
        
        return gpt_code

def error_summarizer(errors):
    prompt = f"""Below is a list of build-time errors generated.
            Summarize the errors these errors.                   
            Do not include any explanation, code snippets, or extra text.

            ### Error:
            {relevant_errors}
                """

    # Connect to GPT
    response = client.complete(
        messages=[
            SystemMessage(content="You are an error summarizer"),
            UserMessage(content=prompt),
        ],
        model=deployment,
        temperature=0.3,
        max_tokens=10000,
        top_p=1.0
    )

    # Extract content 
    gpt_reply = response.choices[0].message.content
    return gpt_reply,relevant_errors

def generate_summary_with_llm(fixed_code, errors):
    prompt_summary = f"""
    Summarize what changes were made to migrate the following Angular code based on the error log.
    Respond only with comma-separated values (CSV format) and no explanation, no code blocks.
    The CSV must contain:
    1. A detailed migration table with columns:
    Line Number,Old Code,New Code,Reason
    2. Then a blank line, followed by:
    3. At the bottom of the output,include a plain-text summary section with:
    - Total Errors Before Fix was <number>
    - Errors Fixed by LLM was <number>
    For newly added lines include line number.
    Do NOT include any headings like "Summary" or "Fixed Code".
    Only print the CSV content — each row on a new line.

    ### Fixed Code:
    {fixed_code}

    ### Error Log:
    {errors}
    """

    response = client.complete(
        messages=[
            SystemMessage(content="You are an Angular migration summarizer."),
            UserMessage(content=prompt_summary),
        ],
        model=deployment,
        temperature=0.3,
        max_tokens=1000,
        top_p=1.0
    )

    llm_output = response.choices[0].message.content
    with open("migration_summary.csv", "w", encoding="utf-8") as f:
        f.write("Line Number,Old Code,New Code,Reason\n")  # optional: write header
        f.write(llm_output.strip())
    
    return llm_output


def split_error_log_by_file(error_log: str):
    file_errors = defaultdict(str)
    current_file = None

    for line in error_log.splitlines():
        match = re.search(r'src\/app\/[^\s:]+(?:\.ts|\.html|\.css)', line)
        if match:
            current_file = match.group()

        if current_file:
            file_errors[current_file] += line + "\n"

    return file_errors

if "stage" not in st.session_state:
    st.session_state.stage = "initial"
if "project_path" not in st.session_state:
    st.session_state.project_path = ""
if "log_file_path" not in st.session_state:
    st.session_state.log_file_path = None
if "error_lines" not in st.session_state:
    st.session_state.error_lines = ""
if "target_filename" not in st.session_state:
    st.session_state.target_filename = ""
if "relevant_errors" not in st.session_state:
    st.session_state.relevant_errors = ""

# ---- App Title ----
st.title("Angular Migration Assistant")
if not st.session_state.project_path:
    st.session_state.project_path = st.text_input("🔍 Enter the Project Path:")
    st.stop()  # Stop here until input is provided

st.success(f"Using Project Path: {st.session_state.project_path}")
# Run Angular build automatically if project path changes
if st.session_state.stage == "initial":
    with st.spinner("🔧 Running Angular Build..."):
        log_file_path = run_angular_build(st.session_state.project_path)
        time.sleep(2)
        st.session_state.log_file_path = log_file_path
        if log_file_path and os.path.exists(log_file_path):
            with open(log_file_path, "r", encoding="utf-8") as f:
                st.session_state.error_lines = f.read()
            st.session_state.file_chunks = split_error_log_by_file(st.session_state.error_lines)
            st.session_state.stage = "errors_loaded"

if st.session_state.stage == "errors_loaded":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    error_log_path = os.path.join(script_dir, "angular_build_errors.txt")  
    filenames = list(st.session_state.file_chunks.keys())
    st.markdown(f"**📁 Number of files with errors:** {len(filenames)}")
    st.markdown("**🗂️ Files with errors:**")
    with st.container():
        with st.expander("🗂️ Click to view files with errors", expanded=False):
            for name in filenames:
                st.markdown(f"- `{name}`")

    target_filename = st.text_input("Enter the error filename: ")
    if target_filename.strip():  # Only proceed if not empty
        errors_summary,relevant_errors = get_error_filenames(st.session_state.file_chunks, target_filename)
        st.success(errors_summary)
        st.session_state.stage = "file_selected"

if st.session_state.stage == "file_selected":

    # summarize the errors 
    errors = error_summarizer(relevant_errors)

    # Build full path to file that needs to be fixed
    filepath = os.path.join(st.session_state.project_path, *target_filename.split("/"))

    # Fix the code
    fixed_code = write_corrected_code(errors, filepath)

    # Generate the summary of the code changes
    summary = generate_summary_with_llm(fixed_code, errors)
    st.text_area("📊 Migration Summary", summary, height=300)

    with open("migration_summary.csv", "r", encoding="utf-8") as f:
        csv_content = f.read()

    st.download_button(
        label="📥 Download Migration Summary CSV",
        data=csv_content,
        file_name="migration_summary.csv",
        mime="text/csv"
    )
    st.session_state.stage = "code_fixed"

if st.session_state.stage == "code_fixed":
    if st.button("🔁 Start Over"):
        project_path = st.session_state.project_path
        for key in list(st.session_state.keys()):
            if key != "project_path":
                del st.session_state[key]
        st.session_state.project_path = project_path
        st.session_state.stage = "initial"
        st.rerun()
