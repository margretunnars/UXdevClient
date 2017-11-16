(function(){
	//Attach to the div uxdev-container - https://www.w3schools.com/jsref/met_document_getelementbyid.asp
	const divHook = document.getElementById('uxdev-container');

	//Hardcoded API routes - should to be done dynamically
	const url = 'http://homestead.app/api/test/2';
	const postUrl = 'http://homestead.app/api/test';

	//Hardcoded testId - should be done dynamically
	const testId = 2;

	//Create empty object that later will hold the data that is fetched
	let dataTest = {};

  	//Assign a unique sessionId for current browser
	let userId = getSessionId();

	//Create an inital state object
	let state = {
		started:false,
		numberOfTasks:0,
		numberOfQuestions:0,
		tasksLeft:0,
		questionsLeft:0,
		inprogress:false,
		quit:false
	};

  	//Object that keeps the results that end up being posted to the API
	let results = {
		tasks: [],
		questions: []
	};

  	//As the user navigates different web pages, the state and results is lost in memory
  	//therefore we need to revive the state and results
	reviveState();
	reviveResults();

  	//Fetch the correct data for the given test - https://scotch.io/tutorials/how-to-use-the-javascript-fetch-api-to-get-data
	fetch(url)
		.then((resp) => resp.json())
		.then((data) => {
			dataTest = data;
			if(state.started === false){
				constructState(data);
				renderStaticHtmlInstructions(1);
			}else{
				renderStaticHtmlTest();
			}
		});

	//Attach functions that need to be called through HTML to the window object
  	//so you can call them through the HTML onClick().
	window.renderStaticHtmlInstructions = renderStaticHtmlInstructions;
	window.renderStaticHtmlTest = renderStaticHtmlTest;
	window.startTest = startTest;
	window.taskRun = taskRun;
	window.ansQuestion = ansQuestion;

	//Function to construct the State depending on test data
	function constructState(data){
		state.started = false;
		state.numberOfTasks = data.tasks.length;
		state.numberOfQuestions = data.questions.length;
		state.tasksLeft = data.tasks.length;
		state.questionsLeft = data.questions.length;
		state.quit = false;
	};

	//Function to create a Task object
	function createTask(id, startTime){
		return {
			userId: userId,
			testId: testId,
			taskId: id,
			startTime:startTime,
			endTime:0,
			complete:false
		}
	};

	//Function to create a Question object
	function createQuestion(id, response){
		return {
			userId: userId,
			testId: testId,
			questionId: id,
			response: response
		}
	}

  	//Function to either restore a sessionId or create one depending on if it exists or not.
  	//then save it to localStorage
	function getSessionId(){
		let temp;
		if(window.localStorage.getItem('uxdevid')){
			temp = window.localStorage.getItem('uxdevid');
		}else{
			temp = 'test_user_id' + (+new Date());
			window.localStorage.setItem('uxdevid', temp);
		}
		return temp;
	}

  	//Function to persist the current State object to localStorage - https://stackoverflow.com/questions/13442819/html5-local-storage-and-variable-types
	function persistState(){
		window.localStorage.setItem('uxdevstate', JSON.stringify(state));
	};

  	//Function to retrive the localStorage state and assign it to the state variable
	function reviveState(){
		if(window.localStorage.getItem('uxdevstate')){
			state = JSON.parse(window.localStorage.getItem('uxdevstate'));
		}
	};

	//Function to persist the result object localStorage
	function persistResults(){
		window.localStorage.setItem('uxdevresults', JSON.stringify(results));
	};

  	//Function to retrive the localStorage results and assign it to the results variable
	function reviveResults(){
		if(window.localStorage.getItem('uxdevresults')){
			results = JSON.parse(window.localStorage.getItem('uxdevresults'));
		}
	};

  	//Function to change the state depending on a set of commands
	function mutateState(action){
		switch(action){
			case 'START':
				state.started = true;
				break;
			case 'INPROGRESS':
				state.inprogress = true;
				break;
			case 'NOTINPROGRESS':
				state.inprogress = false;
				break;
			case 'FINISHTASK':
				state.tasksLeft -= 1;
				break;
			case 'FINISHQUESTION':
				state.questionsLeft -= 1;
				break;
			default:
		}
		persistState();
	};

//HTML//


  	//Function to render static HTML guide the user
	function renderStaticHtmlInstructions(step){
		console.log('enter');
		if(step === 1){
			divHook.innerHTML = `
				<div style="width:40%; height:300px; background:#D8D8D8; position: absolute; top: 20%; left: 30%;">
					<p style="font-size:1em; padding:20px; text-align:center;"> Welcome! You are about to take part in a UXtest.</p>
					<p style="font-size:1em; padding:20px; text-align:center;"> Please follow the instructions for each task of the test and answer questions </p>
					<p style="font-size:1em; padding:20px; text-align:center;"> Thank you for your time! </p>
					<button style="background:#2877AE; float:right; width:25%; height:30px; margin-right:20px; border:none;outline: none;" onClick="renderStaticHtmlInstructions(2)">Continue</button
				</div>
			`;

		}else if(step === 2){
			divHook.innerHTML = `
				<div style="width:40%; height:180px; background:#D8D8D8; position: absolute; top: 20%; left: 30%;"> 
					<p style="font-size:1.5em; padding:20px; text-align:center;"> Are you ready to start the UX test?</p>
					<button style="background:#2877AE; width:25%; height:30px; margin-right:20px; position: absolute; left:35%; border:none; outline:none;" onClick="renderStaticHtmlTest()">Start</button>
				</div>
			`;
		}
	}

	//Function to render static HTML which is used throughout the test. Then it calls the startTest function
  	//to initiate the test process
	function renderStaticHtmlTest(){
		divHook.innerHTML = `
			<div id="staticContainer">
				<div style="width:40%; height:300px; background:#D8D8D8; position: absolute; top: 20%; left: 30%;">
					<div id="fillData"></div>
				</div>
			</div>
			`;
		startTest();
	}

	//Function that renders HTML and attaches to the container it is past as a parameter
  	//the function renders HTML that instructs the user what he/she is supposed to do in 
  	//the test. If the current route is not equal to the URL where the task should start
  	//the user gets redirected to the currect start URL.
	function taskHTML(container){
		if(window.document.location.href === dataTest.tasks[state.numberOfTasks - state.tasksLeft].start_url){
			container.innerHTML = `
				<div style="font-size:1em; padding:20px; text-align:center;">${dataTest.tasks[state.numberOfTasks - state.tasksLeft].name}</div>
				<div style="font-size:1em; padding:20px; text-align:center;"> ${dataTest.tasks[state.numberOfTasks - state.tasksLeft].instructions}</div>
				<div style="font-size:1em; padding:20px; text-align:center;"> Are you ready ?</div>
				<div style="font-size:1em; padding:20px; text-align:center;">Press OK to begin task</div>
				<button style="background:#2877AE; width:25%; height:30px; margin-right:20px; position: absolute; left:38%; border:none; outline:none;" onClick="taskRun()">Ok</button>
			`;	
		}else{
			window.document.location.href = dataTest.tasks[state.numberOfTasks - state.tasksLeft].start_url;
		}
	}

  	//Function that manages the process of running a single task based on the current state
	function taskRun(){
		let container = document.getElementById('staticContainer');
		container.innerHTML = "";

		//Find the current task depening on the state
		let task = dataTest.tasks[state.numberOfTasks - state.tasksLeft];

		//If the task is undefined call the renderStaticHtmlTest which will move you on to questions
		if(!task){
			return renderStaticHtmlTest();
		}

		//The task is completed and results are recorded
		if(window.document.location.href === task.end_url && state.inprogress === true){
			results.tasks[state.numberOfTasks - state.tasksLeft].endTime = new Date();
			results.tasks[state.numberOfTasks - state.tasksLeft].complete = true;
			persistResults();
			mutateState('FINISHTASK');
			mutateState('NOTINPROGRESS');
			return taskRun();
		}

	    //If the state is not inprogress and the task is not at the correct start_url navigate to the tasks start url
		if(window.document.location.href !== task.start_url && state.inprogress === false){
			window.document.location.href = task.start_url;
		}
		else{
			//start time
			if(results.tasks.length == (state.numberOfTasks - state.tasksLeft)){
				results.tasks.push(createTask(task.id, new Date()));
				mutateState('INPROGRESS');
				persistResults();
			}
			}
		}

	//Function to answer a single question
  	//handles both likert scale questions
  	//and text answers
	function ansQuestion(type){
		let response;
		let question =  dataTest.questions[state.numberOfQuestions - state.questionsLeft];
		if(type === 'likert'){
			response = document.querySelector('input[name="likert"]:checked').value;
		}else{
			response = document.getElementById('answer').value;
		}
		results.questions.push(createQuestion(question.id, response));
		mutateState('FINISHQUESTION');
		persistResults();
		startTest();
	}

  	//Render questions based on either likert scale or text answers
	function questionHTML(container){
		if(!dataTest.questions[state.numberOfQuestions - state.questionsLeft].likert_scale){
			container.innerHTML = `
				<div style="font-size:1em; padding:20px; text-align:center;"> 
					Question 
					<div>
						${dataTest.questions[state.numberOfQuestions - state.questionsLeft].question}
					</div>
					<textarea rows="10" cols="50" placeholder="Write your answer here" id="answer"></textarea></br>
					<button style="background:#2877AE; width:25%; height:30px; margin-right:20px; border:none;" onClick="ansQuestion('nonLikert')">Answer</button>
				</div>
			`;
		}else{
			container.innerHTML = `
			   <style>

			    </style>
				<div style="font-size:1em; padding:20px; text-align:center;">
					Question 
					<div>
						${dataTest.questions[state.numberOfQuestions - state.questionsLeft].question}
					</div> 
					<div style="height:50px;">
					<div>
            			Very bad 
            			<input type="radio" name="likert" value="1" />
            			<input type="radio" name="likert" value="2" />
            			<input type="radio" name="likert" value="3" />
            			<input type="radio" name="likert" value="4" />
           				<input type="radio" name="likert" value="5" /> 
           				Very good
        			</div>
        			</div>
        			<button style="background:#2877AE; width:25%; height:30px; margin-right:20px; border:none;" onClick="ansQuestion('likert')">Answer</button>
        		</div>
			`;
			}
		}
		
  //Function to start the test again and again and take decision based on the state
  //in the case where the test is finished it also posts the results to the API
	function startTest(){
		let container = document.getElementById('fillData');

		mutateState('START');
		//run test if there are tasks left to be done
		if(dataTest.tasks.length > 0 && state.tasksLeft > 0){
			if(!state.inprogress)
				taskHTML(container);
			else
				taskRun();
		//run questions if there are questions left to be answered
		}else if(dataTest.questions.length > 0 && state.questionsLeft > 0){
			questionHTML(container);
		//test finished - post the results to the API
		}else if(dataTest.tasks.length > 0 || dataTest.questions.length > 0){
			container.innerHTML = "Test finished thank you!!";
			fetch(postUrl, {
			  method: 'POST',
			  mode: 'no-cors',
			  headers: {
    			'Content-Type': 'application/json'
  			  },
			  body: JSON.stringify(results)
			}).then(res => {
			  	window.localStorage.removeItem('uxdevstate');
			  	window.localStorage.removeItem('uxdevresults');
			  });
		}else{
			throw new Error('No test data');
		}
	}
})()