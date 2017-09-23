(function(){
	const divHook = document.getElementById('uxdev-container');
	const url = 'http://homestead.app/api/test/4';
	const testId = 4;
	let dataTest = {};

	let state = {
		started:false,
		numberOfTasks:0,
		numberOfQuestions:0,
		tasksLeft:0,
		questionsLeft:0,
		inprogress:false,
		quit:false
	};

	let results = {
		tasks: [],
		questions: []
	};

	reviveState();
	reviveResults();

	fetch(url)
		.then((resp) => resp.json())
		.then((data) => {
			dataTest = data;
			if(state.started === false){
				constructState(data);
				renderStaticHtmlInstructions(1);
			}else{
				renderStaticHtmlTest();
				startTest();
			}
		});

	window.renderStaticHtmlInstructions = renderStaticHtmlInstructions;
	window.renderStaticHtmlTest = renderStaticHtmlTest;
	window.startTest = startTest;
	window.taskRun = taskRun;
	window.ansQuestion = ansQuestion;

	function constructState(data){
		state.started = false;
		state.numberOfTasks = data.tasks.length;
		state.numberOfQuestions = data.questions.length;
		state.tasksLeft = data.tasks.length;
		state.questionsLeft = data.questions.length;
		state.quit = false;
	};

	function createTask(id, startTime){
		return {
			testId: testId,
			taskId: id,
			startTime:startTime,
			endTime:0,
			complete:false
		}
	};


	function createQuestion(id, response){
		return {
			testId: testId,
			questionId: id,
			response: response
		}
	}



	function persistState(){
		window.localStorage.setItem('uxdevstate', JSON.stringify(state));
	};

	function reviveState(){
		if(window.localStorage.getItem('uxdevstate')){
			state = JSON.parse(window.localStorage.getItem('uxdevstate'));
		}
	};

	function persistResults(){
		window.localStorage.setItem('uxdevresults', JSON.stringify(results));
	};

	function reviveResults(){
		if(window.localStorage.getItem('uxdevresults')){
			results = JSON.parse(window.localStorage.getItem('uxdevresults'));
		}
	};

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
				<div style="width:8%; height:12%; border: solid 2px #BFBFBF; border-radius: 50%; position: absolute; top: 10%; left: 90%;"> 
					<p style="font-size:1.8em; text-align:center;"> i </p>
				</div>
				<div style="width: 0; height: 0; border-style: solid; border-width: 40px 0 40px 63px; border-color: transparent transparent transparent #BFBFBF; position: absolute; top: 11%; left: 85%;">
				</div>
				<div style="width:20%; height: 200px; background:#D8D8D8; position:absolute; top:11%; left:65%; ">
					<p style="font-size:1em; padding:20px; text-align:center;"> If you need to read the task instructions again - </p>
					<p style="font-size:1em; padding:20px; text-align:center;"> Please press the Information button. </p>
					<button style="background:#2877AE; float:right; width:25%; height:30px; margin-right:10px; margin-top:-36px; border:none;outline: none;" onClick="renderStaticHtmlInstructions(3)">Continue</button
				</div>
			`;
		}else if(step === 3){ 
			divHook.innerHTML = `
				<div style="width:8%; height:12%; border: solid 2px #BFBFBF; border-radius: 50%; position: absolute; top: 70%; left: 90%;">
					<p style="font-size:1.8em; text-align:center;"> X </p>
				</div>
				<div style="width: 0; height: 0; border-style: solid; border-width: 40px 0 40px 63px; border-color: transparent transparent transparent #BFBFBF; position: absolute; top: 71%; left: 85%;">
				</div>
				<div style="width:20%; height: 200px; background:#D8D8D8; position:absolute; top:71%; left:65%; ">
					<p style="font-size:1em; padding:20px; text-align:center;"> If you need to quit the test while doing a task - </p>
					<p style="font-size:1em; padding:20px; text-align:center;"> Please press the Quit button. </p>
					<button style="background:#2877AE; float:right; width:25%; height:30px; margin-right:10px; margin-top:-19px; border:none;outline: none;" onClick="renderStaticHtmlInstructions(4)">Continue</button
				</div>

			`;
		}else if(step === 4){
			divHook.innerHTML = `
				<div style="width:40%; height:180px; background:#D8D8D8; position: absolute; top: 20%; left: 30%;"> 
					<p style="font-size:1.5em; padding:20px; text-align:center;"> Are you ready to start the UX test?</p>
					<button style="background:#2877AE; width:25%; height:30px; margin-right:20px; position: absolute; left:35%; border:none; outline:none;" onClick="renderStaticHtmlTest()">Start</button>
				</div>
			`;
		}
	}

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

	function taskRoute(container){
		if(window.document.location.href === dataTest.tasks[state.numberOfTasks - state.tasksLeft].start_url){
			container.innerHTML = `
				<div style="font-size:1em; padding:20px; text-align:center;"> Task - ${dataTest.tasks[state.numberOfTasks - state.tasksLeft].name}</div>
				<div style="font-size:1em; padding:20px; text-align:center;"> ${dataTest.tasks[state.numberOfTasks - state.tasksLeft].instructions}</div>
				<div style="font-size:1em; padding:20px; text-align:center;"> Are you ready ?</div>
				<div style="font-size:1em; padding:20px; text-align:center;">Press OK to begin task</div>
				<button style="background:#2877AE; width:25%; height:30px; margin-right:20px; position: absolute; left:38%; border:none; outline:none;" onClick="taskRun()">Ok</button>
			`;	
		}else{
			window.document.location.href = dataTest.tasks[state.numberOfTasks - state.tasksLeft].start_url;
		}
	}

	function taskRun(){
		let container = document.getElementById('staticContainer');
		container.innerHTML = "";

		//finna rétta task miðað við state
		let task = dataTest.tasks[state.numberOfTasks - state.tasksLeft];

		if(!task){
			return renderStaticHtmlTest();
		}
		//go to start url
		if(window.document.location.href === task.end_url && state.inprogress === true){
			results.tasks[state.numberOfTasks - state.tasksLeft].endTime = new Date();
			results.tasks[state.numberOfTasks - state.tasksLeft].complete = true;
			persistResults();
			mutateState('FINISHTASK');
			mutateState('NOTINPROGRESS');
			return taskRun();
		}

		if(window.document.location.href !== task.start_url && state.inprogress === false){
			window.document.location.href = task.start_url;
		}else{
			//start time
			if(results.tasks.length == (state.numberOfTasks - state.tasksLeft)){
				results.tasks.push(createTask(task.id, new Date()));
				mutateState('INPROGRESS');
				persistResults();
			}
		}
	}

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

	function questionRoute(container){
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

	function startTest(){
		let container = document.getElementById('fillData');

		mutateState('START');
		if(dataTest.tasks.length > 0 && state.tasksLeft > 0){
			if(!state.inprogress)
				taskRoute(container);
			else
				taskRun();
		}else if(dataTest.tasks.length > 0 && state.questionsLeft > 0){
			questionRoute(container);
		}else{
			container.innerHTML = "";
			alert('test is finished!');
		}
	}

})()