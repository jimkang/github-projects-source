var callNextTick = require('call-next-tick');

function shamble(tasks) {
  return startShambling;

  function startShambling() {
    var tasksComplete = 0;
    var lastResultArray = Array.prototype.slice.call(arguments);
    runNextTask();  

    function runNextTask() {
      var nextTask = tasks[tasksComplete];
      // console.log('nextTask', nextTask);
      // console.log('lastResultArray', lastResultArray);
      var nextTaskFn = nextTask[1];
      var nextTaskType = nextTask[0];

      if (nextTaskType === 'a') {
        nextTaskFn.apply(nextTaskFn, lastResultArray.concat([callback]));
      }
      else {
        lastResultArray = [nextTaskFn.apply(nextTaskFn, lastResultArray)];
        tasksComplete += 1;
        if (tasksComplete < tasks.length) {
          callNextTick(runNextTask);
        }
      }

      function callback() {
        lastResultArray = Array.prototype.slice.call(arguments);
        tasksComplete += 1;

        if (tasksComplete < tasks.length) {
          callNextTick(runNextTask);
        }
      }
    }
  }
}

module.exports = shamble;
