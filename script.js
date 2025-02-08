function todoistBackup() {

    // handles API token secret
    const scriptProperties = PropertiesService.getScriptProperties();
    const apiToken = scriptProperties.getProperty('apiToken');
  
    // defines params for API Call
    const params = {
      method: 'get',
      headers: {'Authorization': `Bearer ${apiToken}`},
    };
  
    // adds API endpoint
    const tasksAPI = 'https://api.todoist.com/rest/v2/tasks';
    const projectsAPI = 'https://api.todoist.com/rest/v2/projects';
    const sectionsAPI = 'https://api.todoist.com/rest/v2/sections';
  
    // defines google sheet and clears it before adding the data
    const sheetRawData = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("raw_data");
    const sheetDataProjects = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("raw_data_projects");
    const sheetDataSections = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("raw_data_section");
    sheetRawData.clearContents();
    sheetDataProjects.clearContents();
    sheetDataSections.clearContents();
  
    // adds headers
    sheetRawData.getRange(1, 1, 1, 9).setValues([["Task ID", "Task Content","Task Description", "Due Date", "Recurring", "Priority", "Project", "Section", "Parent Task"]]);
    sheetDataProjects.getRange(1, 1, 1, 2).setValues([["Project ID", "Project Name"]]);
    sheetDataSections.getRange(1, 1, 1, 3).setValues([["Section ID", "Section Name" ,"Project ID"]]);
  
  
  
    // tries to get a response from TASKS endpoint and appends rows
    try {
      const response = UrlFetchApp.fetch(tasksAPI, params);
      const tasks = JSON.parse(response.getContentText()); // Convert response to JSON
      if (tasks.length > 0) {
        tasks.forEach(task => {
          const dueDate = task.due ? task.due.date : '';
          const isRecurring = task.due ? task.due.isRecurring : '';
          sheetRawData.appendRow([
            task.id,
            task.content,
            task.description,
            dueDate,
            isRecurring,
            task.priority,
            task.project_id,
            task.section_id,
            task.parent_id,
          ]);
        });
        Logger.log(`Added ${tasks.length} open tasks`);
      } else {
        Logger.log('No open tasks found');
      }
    } catch (error) {
      Logger.log('Error: ' + error.message);
    }
  
    // tries to get a response from the PROJECTS endpoint and appends rows
    try {
      const response = UrlFetchApp.fetch(projectsAPI, params);
      const projects = JSON.parse(response.getContentText()); // Convert response to JSON
      if (projects.length > 0) {
        projects.forEach(project => {
          sheetDataProjects.appendRow([
            project.id,
            project.name
          ]);
        });
        Logger.log(`Added ${tasks.length} open tasks`);
      } else {
        Logger.log('No open tasks found');
      }
    } catch (error) {
      Logger.log('Error: ' + error.message);
  }
  
  
    // tries to get a response from the PROJECTS endpoint and appends rows
  try {
    const response = UrlFetchApp.fetch(sectionsAPI, params);
    const sections = JSON.parse(response.getContentText()); // Convert response to JSON
    if (sections.length > 0) {
      sections.forEach(section => {
        sheetDataSections.appendRow([
          section.id,
          section.name,
          section.project_id
        ]);
      });
      Logger.log(`Added ${tasks.length} open tasks`);
    } else {
      Logger.log('No open tasks found');
    }
  } catch (error) {
    Logger.log('Error: ' + error.message);
  }
  }
  
  // Create daily trigger (run once)
  function CreateDailyTrigger() {
    ScriptApp.newTrigger('todoistBackup')
      .timeBased()
      .everyDays(1)
      .atHour(9) // 9 AM daily
      .create();
  }