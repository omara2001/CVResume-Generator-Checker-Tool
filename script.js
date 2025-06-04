// Railway backend URL - ensure no trailing slash
const API_URL = 'https://cvresume-generator-checker-endpoints-production.up.railway.app/';
let skills = [];
let experiences = [];
let education = [];
let currentDocumentId = null;

// Debug mode for detailed error logging
const DEBUG_MODE = true;

// Function to ensure proper URL formatting
function getApiUrl(endpoint) {
    // Remove trailing slash from API_URL if present
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    // Add leading slash to endpoint if not present
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${formattedEndpoint}`;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initTabSwitching();
    initSkillsManagement();
    initFileUpload();
    initDebugMode();

    // Initialize with some default data for demo
    addExperience();
    addEducation();
});

// Initialize debug mode
function initDebugMode() {
    // Add a hidden debug button that appears when clicking 10 times on the header
    const header = document.querySelector('.header');
    let clickCount = 0;

    header.addEventListener('click', () => {
        clickCount++;
        if (clickCount >= 10) {
            // Create debug button if it doesn't exist
            if (!document.getElementById('debugButton')) {
                const debugBtn = document.createElement('button');
                debugBtn.id = 'debugButton';
                debugBtn.className = 'debug-btn';
                debugBtn.innerHTML = '<i class="fas fa-bug"></i> Debug Info';
                debugBtn.onclick = showDebugInfo;

                document.querySelector('.container').appendChild(debugBtn);

                // Add debug button style
                const style = document.createElement('style');
                style.textContent = `
                    .debug-btn {
                        position: fixed;
                        bottom: 20px;
                        right: 20px;
                        background: #ff5722;
                        color: white;
                        border: none;
                        padding: 10px 15px;
                        border-radius: 5px;
                        cursor: pointer;
                        z-index: 1000;
                    }
                    .debug-info {
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: white;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 0 20px rgba(0,0,0,0.3);
                        z-index: 1001;
                        max-width: 80%;
                        max-height: 80vh;
                        overflow: auto;
                    }
                    .debug-info pre {
                        white-space: pre-wrap;
                        word-break: break-all;
                    }
                    .debug-close {
                        position: absolute;
                        top: 10px;
                        right: 10px;
                        background: #ff5722;
                        color: white;
                        border: none;
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        cursor: pointer;
                    }
                `;
                document.head.appendChild(style);
            }
        }
    });
}

// Show debug information
function showDebugInfo() {
    // Create debug info modal
    const debugInfo = document.createElement('div');
    debugInfo.className = 'debug-info';

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'debug-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => debugInfo.remove();

    // Collect debug information
    const info = {
        apiUrl: API_URL,
        skills: skills,
        experiences: experiences,
        education: education,
        currentDocumentId: currentDocumentId,
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        localStorage: { ...localStorage },
        formData: {
            name: document.getElementById('name').value,
            jobTitle: document.getElementById('jobTitle').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            skillInput: document.getElementById('skillInput').value,
            additionalInfo: document.getElementById('additionalInfo').value,
            cvStyle: document.getElementById('cvStyle').value
        }
    };

    // Create content
    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(info, null, 2);

    // Assemble modal
    debugInfo.appendChild(closeBtn);
    debugInfo.appendChild(document.createElement('h3')).textContent = 'Debug Information';
    debugInfo.appendChild(pre);

    // Add to document
    document.body.appendChild(debugInfo);
}

// Tab switching
function initTabSwitching() {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;

            // Update active button
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update active content
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

// Skills management
function initSkillsManagement() {
    document.getElementById('skillInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            addSkill(e.target.value.trim());
            e.target.value = '';
        }
    });
}

function addSkill(skill) {
    if (!skills.includes(skill)) {
        skills.push(skill);
        renderSkills();
    }
}

function removeSkill(index) {
    skills.splice(index, 1);
    renderSkills();
}

function renderSkills() {
    const container = document.getElementById('skillsContainer');
    container.innerHTML = skills.map((skill, index) => `
        <span class="skill-tag">
            ${skill}
            <i class="fas fa-times" onclick="removeSkill(${index})"></i>
        </span>
    `).join('');
}

// Experience management
function addExperience() {
    experiences.push({
        company: '',
        role: '',
        duration: '',
        description: ''
    });
    renderExperiences();
}

function removeExperience(index) {
    experiences.splice(index, 1);
    renderExperiences();
}

function updateExperience(index, field, value) {
    experiences[index][field] = value;
}

function renderExperiences() {
    const container = document.getElementById('experienceContainer');
    container.innerHTML = experiences.map((exp, index) => `
        <div class="experience-item">
            <button class="remove-btn" onclick="removeExperience(${index})">
                <i class="fas fa-times"></i>
            </button>
            <div class="form-row">
                <div class="form-group">
                    <label>Company</label>
                    <input type="text" value="${exp.company}"
                           onchange="updateExperience(${index}, 'company', this.value)"
                           placeholder="Company Name">
                </div>
                <div class="form-group">
                    <label>Role</label>
                    <input type="text" value="${exp.role}"
                           onchange="updateExperience(${index}, 'role', this.value)"
                           placeholder="Job Title">
                </div>
            </div>
            <div class="form-group">
                <label>Duration</label>
                <input type="text" value="${exp.duration}"
                       onchange="updateExperience(${index}, 'duration', this.value)"
                       placeholder="e.g., Jan 2020 - Present">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea onchange="updateExperience(${index}, 'description', this.value)"
                          placeholder="Describe your responsibilities and achievements...">${exp.description}</textarea>
            </div>
        </div>
    `).join('');
}

// Education management
function addEducation() {
    education.push({
        degree: '',
        institution: '',
        year: ''
    });
    renderEducation();
}

function removeEducation(index) {
    education.splice(index, 1);
    renderEducation();
}

function updateEducation(index, field, value) {
    education[index][field] = value;
}

function renderEducation() {
    const container = document.getElementById('educationContainer');
    container.innerHTML = education.map((edu, index) => `
        <div class="education-item">
            <button class="remove-btn" onclick="removeEducation(${index})">
                <i class="fas fa-times"></i>
            </button>
            <div class="form-row">
                <div class="form-group">
                    <label>Degree</label>
                    <input type="text" value="${edu.degree}"
                           onchange="updateEducation(${index}, 'degree', this.value)"
                           placeholder="e.g., Bachelor of Science in Computer Science">
                </div>
                <div class="form-group">
                    <label>Institution</label>
                    <input type="text" value="${edu.institution}"
                           onchange="updateEducation(${index}, 'institution', this.value)"
                           placeholder="University Name">
                </div>
            </div>
            <div class="form-group">
                <label>Year</label>
                <input type="text" value="${edu.year}"
                       onchange="updateEducation(${index}, 'year', this.value)"
                       placeholder="e.g., 2020">
            </div>
        </div>
    `).join('');
}

// File upload handling
function initFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
}

async function handleFileUpload(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        showLoading('check');

        // Check file type and size
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx') && !file.name.endsWith('.txt')) {
            throw new Error('Invalid file type. Please upload a PDF, DOCX, or TXT file.');
        }

        if (file.size > maxSize) {
            throw new Error('File is too large. Maximum size is 10MB.');
        }

        const response = await fetch(getApiUrl('upload-cv'), {
            method: 'POST',
            body: formData
        });

        const data = await handleResponse(response);

        // Check if we received CV text
        if (data && data.cv_text) {
            // Format the CV text and set it in the textarea
            const formattedText = formatCVText(data.cv_text);
            document.getElementById('cvText').value = formattedText;
            showSuccess('check', 'File uploaded successfully!');
        } else if (data && typeof data === 'object') {
            // If we got an object but no cv_text, stringify it
            document.getElementById('cvText').value = JSON.stringify(data, null, 2);
            showSuccess('check', 'File uploaded successfully!');
        } else {
            throw new Error('No CV text was extracted from the file');
        }
    } catch (error) {
        showError('check', 'Error uploading file: ' + error.message);
        logError('File Upload Error', error);
    } finally {
        hideLoading('check');
    }
}

// Generate CV
async function generateCV() {
    // Validate inputs
    const name = document.getElementById('name').value;
    const jobTitle = document.getElementById('jobTitle').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    if (!name || !jobTitle || !email || !phone || skills.length === 0) {
        showError('generate', 'Please fill in all required fields and add at least one skill.');
        return;
    }

    const requestData = {
        name,
        email,
        phone,
        job_title: jobTitle,
        skills,
        experience: experiences,
        education,
        additional_info: document.getElementById('additionalInfo').value,
        style: document.getElementById('cvStyle').value
    };

    try {
        showLoading('generate');
        console.log('Sending request to generate CV:', requestData);

        const response = await fetch(getApiUrl('generate-cv'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const result = await handleResponse(response);
        currentDocumentId = result.document_id;

        document.getElementById('generatedSummary').textContent = result.generated_summary || result.preview_text;
        document.getElementById('generateResults').style.display = 'block';
        showSuccess('generate', 'CV generated successfully!');
    } catch (error) {
        showError('generate', 'Error generating CV: ' + error.message);
        logError('Generate CV Error', error);
    } finally {
        hideLoading('generate');
    }
}

// Check CV
async function checkCV() {
    let cvText = document.getElementById('cvText').value.trim();
    const targetJob = document.getElementById('targetJob').value;

    if (!cvText) {
        showError('check', 'Please upload a CV or paste CV text.');
        return;
    }

    // Process the input text to handle different formats
    let processedText = formatCVText(cvText);
    let checkType = 'full';

    // Check if the input is JSON to extract check_type if available
    if (cvText.startsWith('{') && cvText.endsWith('}')) {
        try {
            const jsonData = JSON.parse(cvText);
            if (jsonData.check_type) {
                checkType = jsonData.check_type;
            }
        } catch (e) {
            // If JSON parsing fails, continue with default check_type
            console.warn("Failed to extract check_type from JSON:", e);
        }
    }

    // Prepare the request data
    const requestData = {
        cv_text: processedText,
        target_job: targetJob,
        check_type: checkType
    };

    try {
        showLoading('check');
        console.log('Sending request to review CV:', requestData);

        const response = await fetch(getApiUrl('review-cv'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const result = await handleResponse(response);

        // Check if we got a valid result
        if (!result || (typeof result === 'object' && Object.keys(result).length === 0)) {
            throw new Error('The server returned an empty or invalid response. Please try again later.');
        }

        displayCheckResults(result);
        document.getElementById('checkResults').style.display = 'block';
        showSuccess('check', 'CV analysis completed!');
    } catch (error) {
        // Show a more user-friendly error message
        if (error.message.includes('Failed to generate JSON')) {
            showError('check', 'The CV analysis service is currently experiencing issues. Please try again later or contact support if the problem persists.');
        } else if (error.message.includes('500')) {
            showError('check', 'Server error: The CV analysis service is temporarily unavailable. Our team has been notified and is working on a fix.');
        } else if (error.message.includes('SyntaxError')) {
            showError('check', 'Error processing your CV: The format appears to be invalid. Please try uploading a different file or format.');
        } else {
            showError('check', 'Error analyzing CV: ' + error.message);
        }

        // Still show results section with default values
        displayCheckResults({});
        document.getElementById('checkResults').style.display = 'block';

        logError('Check CV Error', error);
    } finally {
        hideLoading('check');
    }
}

function displayCheckResults(results) {
    // Ensure we have valid data with default values if properties are missing
    const data = {
        overall_score: results.overall_score || 0,
        ats_score: results.ats_score || 0,
        strengths: Array.isArray(results.strengths) ? results.strengths : [],
        suggestions: Array.isArray(results.suggestions) ? results.suggestions : [],
        keyword_analysis: results.keyword_analysis || {},
        weaknesses: Array.isArray(results.weaknesses) ? results.weaknesses : [],
        grammar_issues: Array.isArray(results.grammar_issues) ? results.grammar_issues : []
    };

    // Update scores
    document.getElementById('overallScore').textContent = data.overall_score;
    document.getElementById('atsScore').textContent = data.ats_score;

    // Display strengths
    const strengthsList = document.getElementById('strengthsList');
    if (data.strengths.length > 0) {
        strengthsList.innerHTML = data.strengths.map(strength => `
            <li class="suggestion-item">
                <i class="fas fa-check-circle" style="color: #10b981;"></i>
                <span>${strength}</span>
            </li>
        `).join('');
    } else {
        strengthsList.innerHTML = `
            <li class="suggestion-item">
                <i class="fas fa-info-circle" style="color: #4285f4;"></i>
                <span>No specific strengths identified. Try adding more detailed information to your CV.</span>
            </li>
        `;
    }

    // Display suggestions
    const suggestionsList = document.getElementById('suggestionsList');
    if (data.suggestions.length > 0) {
        suggestionsList.innerHTML = data.suggestions.map(suggestion => `
            <li class="suggestion-item">
                <i class="fas fa-lightbulb" style="color: #f59e0b;"></i>
                <span>${suggestion}</span>
            </li>
        `).join('');
    } else {
        suggestionsList.innerHTML = `
            <li class="suggestion-item">
                <i class="fas fa-info-circle" style="color: #4285f4;"></i>
                <span>No specific suggestions available at this time.</span>
            </li>
        `;
    }

    // Display keywords
    const keywordsList = document.getElementById('keywordsList');
    const keywordEntries = Object.entries(data.keyword_analysis);
    if (keywordEntries.length > 0) {
        keywordsList.innerHTML = keywordEntries.map(([keyword, count]) => `
            <span class="skill-tag" style="background: ${count > 0 ? '#10b981' : '#ef4444'};">
                ${keyword} (${count})
            </span>
        `).join('');
    } else {
        keywordsList.innerHTML = `
            <span class="skill-tag" style="background: #4285f4;">
                No keywords analyzed
            </span>
        `;
    }

    // Display weaknesses
    const weaknessesList = document.getElementById('weaknessesList');
    if (data.weaknesses.length > 0) {
        weaknessesList.innerHTML = data.weaknesses.map(weakness => `
            <li class="suggestion-item">
                <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
                <span>${weakness}</span>
            </li>
        `).join('');
    } else {
        weaknessesList.innerHTML = `
            <li class="suggestion-item">
                <i class="fas fa-info-circle" style="color: #4285f4;"></i>
                <span>No specific weaknesses identified.</span>
            </li>
        `;
    }
}

// Download CV
async function downloadCV(format) {
    if (!currentDocumentId) return;

    try {
        window.location.href = getApiUrl(`download/${currentDocumentId}?format=${format}`);
    } catch (error) {
        showError('generate', 'Error downloading CV: ' + error.message);
        logError('Download CV Error', error);
    }
}

// Utility functions
function showLoading(tab) {
    document.getElementById(`${tab}Loading`).style.display = 'block';
    document.querySelector(`#${tab}-tab .submit-btn`).disabled = true;
}

function hideLoading(tab) {
    document.getElementById(`${tab}Loading`).style.display = 'none';
    document.querySelector(`#${tab}-tab .submit-btn`).disabled = false;
}

function showError(tab, message) {
    const errorEl = document.getElementById(`${tab}-error`);
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    setTimeout(() => {
        errorEl.style.display = 'none';
    }, 5000);
}

function showSuccess(tab, message) {
    const successEl = document.getElementById(`${tab}-success`);
    successEl.textContent = message;
    successEl.style.display = 'block';
    setTimeout(() => {
        successEl.style.display = 'none';
    }, 5000);
}

// Enhanced error handling
async function handleResponse(response) {
    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;

        try {
            // Try to parse as JSON
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.detail || errorJson.message || errorJson.error || 'Unknown error';
        } catch (e) {
            // If not JSON, use text
            errorMessage = errorText || `HTTP error ${response.status}`;
        }

        throw new Error(errorMessage);
    }

    try {
        const jsonData = await response.json();
        return jsonData;
    } catch (error) {
        console.error("Error parsing JSON response:", error);

        // Create a default response object with empty values
        return {
            overall_score: 0,
            ats_score: 0,
            strengths: [],
            suggestions: [],
            keyword_analysis: {},
            weaknesses: [],
            grammar_issues: [],
            document_id: null,
            generated_summary: "There was an error processing your request. Please try again."
        };
    }
}

function logError(context, error) {
    if (DEBUG_MODE) {
        console.error(`[${context}]`, error);
    }
}

// Helper function to detect and format CV text
function formatCVText(input) {
    // Trim the input
    const text = input.trim();

    // Check if it's already JSON
    if (text.startsWith('{') && text.endsWith('}')) {
        try {
            // Try to parse as JSON
            const jsonData = JSON.parse(text);

            // If it has cv_text property, return that
            if (jsonData.cv_text) {
                return jsonData.cv_text;
            }

            // Otherwise, return the stringified JSON
            return JSON.stringify(jsonData, null, 2);
        } catch (e) {
            // If parsing fails, return the original text
            console.warn("JSON parsing failed in formatCVText:", e);
            return text;
        }
    }

    // If it's not JSON, return as is
    return text;
}
