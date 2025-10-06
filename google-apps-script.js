// Google Apps Script for Show Stoppers Academy Form Submissions
// This script handles form submissions and saves them to Google Sheets

// Configuration
const CONFIG = {
  SHEET_ID: 'YOUR_GOOGLE_SHEET_ID', // Replace with your actual Google Sheet ID
  CONTACT_SHEET_NAME: 'Contact Submissions',
  REGISTRATION_SHEET_NAME: 'Program Registrations',
  EMAIL_NOTIFICATIONS: {
    enabled: true,
    recipient: 'your-email@showstoppersacademy.com', // Replace with your email
    subject: 'New Form Submission - Show Stoppers Academy'
  }
};

// Main function to handle all form submissions
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const formData = data.data;

    let result;
    
    switch (action) {
      case 'submitContactForm':
        result = submitContactForm(formData);
        break;
      case 'submitRegistrationForm':
        result = submitRegistrationForm(formData);
        break;
      default:
        throw new Error('Invalid action specified');
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, result: result }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error processing form submission:', error);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.message 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle contact form submissions
function submitContactForm(data) {
  const sheet = getOrCreateSheet(CONFIG.CONTACT_SHEET_NAME);
  
  // Prepare headers if this is the first submission
  if (sheet.getLastRow() === 0) {
    const headers = [
      'Timestamp',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Subject',
      'Message',
      'Newsletter Subscription',
      'Source'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#dc2626');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
  }

  // Prepare data row
  const rowData = [
    new Date(data.timestamp || new Date()),
    data.firstName || '',
    data.lastName || '',
    data.email || '',
    data.phone || '',
    data.subject || '',
    data.message || '',
    data.newsletter === 'on' ? 'Yes' : 'No',
    data.source || 'Website'
  ];

  // Add data to sheet
  sheet.appendRow(rowData);
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, rowData.length);
  
  // Send email notification if enabled
  if (CONFIG.EMAIL_NOTIFICATIONS.enabled) {
    sendEmailNotification('Contact Form Submission', data);
  }

  return {
    message: 'Contact form submitted successfully',
    timestamp: new Date()
  };
}

// Handle program registration submissions
function submitRegistrationForm(data) {
  const sheet = getOrCreateSheet(CONFIG.REGISTRATION_SHEET_NAME);
  
  // Prepare headers if this is the first submission
  if (sheet.getLastRow() === 0) {
    const headers = [
      'Timestamp',
      'Program',
      'Participant Name',
      'Date of Birth',
      'Parent/Guardian Name',
      'Email',
      'Phone',
      'Emergency Contact',
      'Medical Information',
      'Previous Experience',
      'Goals',
      'Source'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#dc2626');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
  }

  // Prepare data row
  const rowData = [
    new Date(data.timestamp || new Date()),
    data.program || '',
    data.participantName || '',
    data.dateOfBirth || '',
    data.parentName || '',
    data.email || '',
    data.phone || '',
    data.emergencyContact || '',
    data.medicalInfo || '',
    data.previousExperience || '',
    data.goals || '',
    data.source || 'Website'
  ];

  // Add data to sheet
  sheet.appendRow(rowData);
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, rowData.length);
  
  // Send email notification if enabled
  if (CONFIG.EMAIL_NOTIFICATIONS.enabled) {
    sendEmailNotification('Program Registration', data);
  }

  return {
    message: 'Registration submitted successfully',
    timestamp: new Date()
  };
}

// Get or create a sheet with the specified name
function getOrCreateSheet(sheetName) {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  
  return sheet;
}

// Send email notification for new submissions
function sendEmailNotification(type, data) {
  try {
    const subject = `${CONFIG.EMAIL_NOTIFICATIONS.subject} - ${type}`;
    
    let body = `
      <h2>New ${type}</h2>
      <p>A new form submission has been received on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}.</p>
      
      <h3>Submission Details:</h3>
      <ul>
    `;
    
    // Add form fields to email
    Object.entries(data).forEach(([key, value]) => {
      if (value && key !== 'timestamp' && key !== 'source') {
        const fieldName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        body += `<li><strong>${fieldName}:</strong> ${value}</li>`;
      }
    });
    
    body += `
      </ul>
      
      <p>This submission has been automatically saved to the Google Sheet.</p>
      
      <hr>
      <p><em>This is an automated notification from Show Stoppers Academy.</em></p>
    `;
    
    MailApp.sendEmail({
      to: CONFIG.EMAIL_NOTIFICATIONS.recipient,
      subject: subject,
      htmlBody: body
    });
    
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}

// Utility function to format sheet data
function formatSheet(sheet) {
  const range = sheet.getDataRange();
  const values = range.getValues();
  
  if (values.length > 1) {
    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, values[0].length);
    headerRange.setBackground('#dc2626');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    
    // Add borders to all data
    range.setBorder(true, true, true, true, true, true);
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, values[0].length);
    
    // Freeze header row
    sheet.setFrozenRows(1);
  }
}

// Function to set up the spreadsheet (run this once to initialize)
function setupSpreadsheet() {
  try {
    // Create contact submissions sheet
    const contactSheet = getOrCreateSheet(CONFIG.CONTACT_SHEET_NAME);
    formatSheet(contactSheet);
    
    // Create registration submissions sheet
    const registrationSheet = getOrCreateSheet(CONFIG.REGISTRATION_SHEET_NAME);
    formatSheet(registrationSheet);
    
    console.log('Spreadsheet setup completed successfully!');
    
  } catch (error) {
    console.error('Error setting up spreadsheet:', error);
  }
}

// Function to test form submission (for development)
function testContactFormSubmission() {
  const testData = {
    timestamp: new Date().toISOString(),
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '555-123-4567',
    subject: 'Program Inquiry',
    message: 'I would like to learn more about your programs.',
    newsletter: 'on',
    source: 'Test'
  };
  
  const result = submitContactForm(testData);
  console.log('Test submission result:', result);
}

// Function to get submission statistics
function getSubmissionStats() {
  try {
    const contactSheet = getOrCreateSheet(CONFIG.CONTACT_SHEET_NAME);
    const registrationSheet = getOrCreateSheet(CONFIG.REGISTRATION_SHEET_NAME);
    
    const contactCount = Math.max(0, contactSheet.getLastRow() - 1);
    const registrationCount = Math.max(0, registrationSheet.getLastRow() - 1);
    
    const stats = {
      contactSubmissions: contactCount,
      registrationSubmissions: registrationCount,
      totalSubmissions: contactCount + registrationCount,
      lastUpdated: new Date()
    };
    
    console.log('Submission Statistics:', stats);
    return stats;
    
  } catch (error) {
    console.error('Error getting submission stats:', error);
    return null;
  }
}

// Function to export data to CSV (optional utility)
function exportToCSV(sheetName, fileName) {
  try {
    const sheet = getOrCreateSheet(sheetName);
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    // Convert to CSV format
    const csvContent = values.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    // Create a file in Google Drive
    const file = DriveApp.createFile(
      `${fileName}_${new Date().toISOString().split('T')[0]}.csv`,
      csvContent,
      MimeType.CSV
    );
    
    console.log(`CSV file created: ${file.getName()}`);
    return file;
    
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return null;
  }
}
