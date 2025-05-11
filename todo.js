#!/usr/bin/env node

const fs = require('fs');
const inquirer = require('inquirer');
const chalk = require('chalk');

const FILE = 'todos.json';

function loadTodos() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function saveTodos(todos) {
  fs.writeFileSync(FILE, JSON.stringify(todos, null, 2));
}

async function showMenu() {
  const todos = loadTodos();

  const { action } = await inquirer.prompt({
    type: 'list',
    name: 'action',
    message: '📝 What do you want to do?',
    choices: [
      'View Tasks',
      'Add Task',
      'Edit Task',
      'Update Task Status',
      'Delete Task',
      'Exit'
    ]
  });

  switch (action) {
    case 'View Tasks':
      console.log('\n📋 Your To-Do List:');
      if (todos.length === 0) {
        console.log('   (No tasks)');
      } else {
        todos.forEach((t, i) => {
          const status = t.status || 'Pending';
          const icon = {
            Pending: chalk.yellow('⏳'),
            Working: chalk.blue('🛠️'),
            Complete: chalk.green('✅')
          }[status];

          const coloredStatus = {
            Pending: chalk.yellow(status),
            Working: chalk.blue(status),
            Complete: chalk.green(status)
          }[status];

          console.log(`\n${i + 1}. 📁 Project: ${chalk.cyan(t.projectName)}`);
          console.log(`   📝 Task: ${chalk.bold(t.taskName)}`);
          console.log(`   📅 Date: ${chalk.magenta(t.date)}`);
          console.log(`   👤 TL: ${chalk.white(t.tlName)}`);
          console.log(`   🕒 Time: ${t.startTime} → ${t.endTime}`);
          console.log(`   🔄 Status: ${icon} ${coloredStatus}`);
        });
      }
      break;

    case 'Add Task':
      const newTask = await inquirer.prompt([
        { type: 'input', name: 'date', message: 'Enter date (e.g. 2025-05-10):' },
        { type: 'input', name: 'projectName', message: 'Enter project name:' },
        { type: 'input', name: 'taskName', message: 'Enter task name:' },
        { type: 'input', name: 'tlName', message: 'Enter TL name:' },
        { type: 'input', name: 'startTime', message: 'Enter start time (e.g. 10:00 AM):' },
        { type: 'input', name: 'endTime', message: 'Enter end time (e.g. 5:00 PM):' }
      ]);

      todos.push({ ...newTask, status: 'Pending' });
      saveTodos(todos);
      console.log('✅ Task added.');
      break;

    case 'Edit Task':
      if (todos.length === 0) {
        console.log('⚠️ No tasks to edit.');
        break;
      }

      const { editIndex } = await inquirer.prompt({
        type: 'list',
        name: 'editIndex',
        message: 'Choose a task to edit:',
        choices: todos.map((t, i) => ({
          name: `[${t.status}] ${t.projectName} - ${t.taskName}`,
          value: i
        }))
      });

      const taskToEdit = todos[editIndex];
      const updatedTask = await inquirer.prompt([
        { type: 'input', name: 'date', message: `Date [${taskToEdit.date}]:`, default: taskToEdit.date },
        { type: 'input', name: 'projectName', message: `Project Name [${taskToEdit.projectName}]:`, default: taskToEdit.projectName },
        { type: 'input', name: 'taskName', message: `Task Name [${taskToEdit.taskName}]:`, default: taskToEdit.taskName },
        { type: 'input', name: 'tlName', message: `TL Name [${taskToEdit.tlName}]:`, default: taskToEdit.tlName },
        { type: 'input', name: 'startTime', message: `Start Time [${taskToEdit.startTime}]:`, default: taskToEdit.startTime },
        { type: 'input', name: 'endTime', message: `End Time [${taskToEdit.endTime}]:`, default: taskToEdit.endTime }
      ]);

      todos[editIndex] = { ...todos[editIndex], ...updatedTask };
      saveTodos(todos);
      console.log('✏️ Task updated.');
      break;

    case 'Update Task Status':
      if (todos.length === 0) {
        console.log('⚠️ No tasks to update.');
        break;
      }

      const { updateIndex } = await inquirer.prompt({
        type: 'list',
        name: 'updateIndex',
        message: 'Choose a task to update:',
        choices: todos.map((t, i) => ({
          name: `[${t.status}] ${t.projectName} - ${t.taskName}`,
          value: i
        }))
      });

      const { newStatus } = await inquirer.prompt({
        type: 'list',
        name: 'newStatus',
        message: 'Select new status:',
        choices: [
          { name: `${chalk.yellow('⏳ Pending')}`, value: 'Pending' },
          { name: `${chalk.blue('🛠️ Working')}`, value: 'Working' },
          { name: `${chalk.green('✅ Complete')}`, value: 'Complete' }
        ]
      });

      todos[updateIndex].status = newStatus;
      saveTodos(todos);
      console.log(`✅ Task status updated to "${newStatus}".`);
      break;

    case 'Delete Task':
      if (todos.length === 0) {
        console.log('⚠️ No tasks to delete.');
        break;
      }

      const { deleteIndex } = await inquirer.prompt({
        type: 'list',
        name: 'deleteIndex',
        message: 'Choose a task to delete:',
        choices: todos.map((t, i) => ({
          name: `${t.projectName} - ${t.taskName}`,
          value: i
        }))
      });

      const removed = todos.splice(deleteIndex, 1);
      saveTodos(todos);
      console.log(`🗑️ Deleted task: ${removed[0].taskName}`);
      break;

    case 'Exit':
      console.log('👋 Goodbye!');
      process.exit();
  }

  await showMenu();
}

showMenu();
