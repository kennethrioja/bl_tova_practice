// Title : JS script for ToVA [PRACTICE]
// Author : kenneth.rioja@unige.ch
// Date : 02.05.2023

// ############################
// ### experiment variables ###
// ############################
// based on Denkinger Sylvie's 'TOVA_parameters_2023' excel sheet 

var pres_time = 250; // stimulus presentation time
var soa = 2000; // duration between the onset of two consecutive stimuli
// var isi = soa - pres_time; // inter stimulus interval, NOT USE IN THE CODE
var width_px = window.outerWidth; // check https://www.jspsych.org/7.2/plugins/virtual-chinrest/
var height_px = window.outerHeight;
var d_px = Math.sqrt(width_px * width_px + height_px * height_px);
var stim_diag_px = d_px * 0.2;
var stim_width_px = width_px * 0.2; // in px, if needed check https://www.jspsych.org/7.2/plugins/resize/
var tova_up = `
<div class='up' id='shape'><img src='assets/img/shape.png' style="width:${stim_width_px}px"></img></div>
`; // id='shape' is mandatory, without it it won't work, see plugin-html-keyboard-response.js
var tova_down = `
<div class='down' id='shape'><img src='assets/img/shape.png' style="width:${stim_width_px}px"></img></div>
`; // id='shape' is mandatory, without it it won't work, see plugin-html-keyboard-response.js
// background color, see 'assets/css/style.css', grey "#202020" for instructions and black for trials
var fixation_cross = '<div class="fixcross" id="cross">+</div>'; // to change its size, see 'assets/css/style.css'
var practice_array = [1, 1, 0, 1, 0]; // 1 for go, 0 for no go – modify this array to suit your needs
var post_instructions_time = 2000; // time to wait after instruction to begin the trials
var show_fixcross = true; // true = shows fixation cross
var feedback_color = true; // true = changes fixation cross to green/red depending of correct/incorrect response at the end of each trial, see plugin-html-keyboard-response.js
var ask_for_id = true; // true = displays a form asking for subject id, study id and session id, if false the URL MUST CONTAIN '?PROLIFIC_PID=*&STUDY_ID=*&SESSION_ID=*' with '*' being the corresponding values to variables.

// strings
var welcome_str = `
<p>Welcome to the experiment.</p>
<p>Please enter in full screen mode, for Windows press 'F11', for MacOS press 'control' + 'command' + 'F' at the same time.</p>
<p>Click the button below to continue.</p>
`;
var endblock_str1 = `
<p>Well done !</p>
<p>% of correctly answering to TOP shape = 
`
var endblock_str2 = `
%</p>
<p>% of correctly refraining answers to BOTTOM shape = `
var endblock_str3 = `
%</p>
<p>Press the spacebar to continue.</p>
`;

// #####################################
// ### modifications in plugin files ###
// #####################################
// see marks '*MODIFIED*'

// 1) allow the recording of multiple responses during one trial
// https://github.com/jspsych/jsPsych/discussions/1302
// file : plugin-html-keyboard-response.js

// 2) if feedback_color = true, the CSS of the fixation cross changes to green or red depending on true or false response
// file : plugin-html-keyboard-response.js

// 3) for stimulus, I changed default: undefined to default: "" to avoid having a 'undefined' word at the end of a block
// file : plugin-html-keyboard-response.js

// 4) in final csv, creation of 'real_trial_index' column which is the trial_index for each block, 0 if not a real trial, begin by 1 if block
// file : jspsych.js

// 5) grey previous buttons in instructions
// file : plugin-instructions.js

// ###################
// ### Precautions ###
// ###################

// prevent ctrl+r or cmd+r : https://stackoverflow.com/questions/46882116/javascript-prevent-page-refresh-via-ctrl-and-r, https://stackoverflow.com/questions/3902635/how-does-one-capture-a-macs-command-key-via-javascript
$(document).ready(function () {
    $(document).on("keydown", function (e) {
        e = e || window.event;
        if (e.ctrlKey || e.metaKey) {
            var c = e.which || e.keyCode;
            if (c == 82) {
                e.preventDefault();
                e.stopPropagation();
            }
        }
    });
});

// prevent getting back or closing the window : https://stackoverflow.com/questions/12381563/how-can-i-stop-the-browser-back-button-using-javascript
window.onbeforeunload = function () { return "Your work will be lost."; };

// ##########################
// ### initialize jsPsych ###
// ##########################

var jsPsych = initJsPsych();

var timeline = []; // create timeline

// capture info from Prolific through the URL
var get_subject_id = jsPsych.data.getURLVariable('PROLIFIC_PID');
var get_study_id = jsPsych.data.getURLVariable('STUDY_ID');
var get_session_id = jsPsych.data.getURLVariable('SESSION_ID');

if (!ask_for_id) {
    // add variables to data
    jsPsych.data.addProperties({
        subject_id: get_subject_id,
        study_id: get_study_id,
        session_id: get_session_id,
        presentation_time: pres_time,
        soa: soa,
        stimulus_diagonal_in_px: stim_diag_px
    });
} else { // if you asked for entring manually the IDs
    var pp_id = {
        type: jsPsychSurvey,
        pages: function () { // chooses which questions to ask depending on URL infos
            // creates objects
            const id_q = { type: 'text', prompt: 'What is your Prolific PID ?', name: 'survey_subject_id', required: true };
            const study_q = { type: 'text', prompt: 'What is the Study ID ?', name: 'survey_study_id', required: true };
            const session_q = { type: 'text', prompt: 'What is the Session ID ?', name: 'survey_session_id', required: true };
            let id_questions = [[]];
            // ternary, if the previous info is not caught, then ask the question about it else do nothing
            !get_subject_id ? id_questions[0].push(id_q) : null;
            !get_study_id ? id_questions[0].push(study_q) : null;
            !get_session_id ? id_questions[0].push(session_q) : null;
            return (id_questions);
        },
        on_finish: function (data) {
            // add variables to data
            get_subject_id ?
                jsPsych.data.addProperties({ subject_id: get_subject_id })
                : jsPsych.data.addProperties({ subject_id: data.response.survey_subject_id });
            console.log(jsPsych.data.get().last(1).values()[0]);
            console.log(data.subject_id);
            get_study_id ?
                jsPsych.data.addProperties({ study_id: get_study_id })
                : jsPsych.data.addProperties({ study_id: data.response.survey_study_id });
            get_session_id ?
                jsPsych.data.addProperties({ session_id: get_session_id })
                : jsPsych.data.addProperties({ session_id: data.response.survey_session_id });
            jsPsych.data.addProperties({
                presentation_time: pres_time,
                soa: soa,
                stimulus_diagonal: stim_diag_px
            });
        }
    };
    timeline.push(pp_id);
}

var preload = { // preload the images
    type: jsPsychPreload,
    images: ['assets/img/shape.png', // path from html
        'assets/img/tova_up.png',
        'assets/img/tova_down.png']
};
timeline.push(preload);

var welcome_fullscreenOn = { // welcome and fullscreen mode
    type: jsPsychFullscreen,
    message: welcome_str,
    fullscreen_mode: true
};
timeline.push(welcome_fullscreenOn);

var browsercheck = { // get browser data
    type: jsPsychBrowserCheck, // allows to have data on screen width, heigth, browser used, see https://www.jspsych.org/7.2/plugins/browser-check/
    skip_features: ['webaudio', 'webcam', 'microphone']
};
timeline.push(browsercheck);

// ####################
// ### instructions ###
// ####################

var instructions = {
    type: jsPsychInstructions,
    pages: [
        // 1
        'This test measures your ability to pay attention.' + '<br>' +
        '<br>' +
        'You will be presented with briefly flashed displays that contain a shape.',
        // 2
        'If the shape is presented at the TOP, please <span class="highlight-green">press the spacebar</span>' + '<br>' +
        '<br>' +
        '<img src="assets/img/tova_up.png" width="800" heigth="auto"></img>',
        // 3
        'If the shape is presented at the BOTTOM, <span class="highlight-red">don’t press the spacebar</span>' + '<br>' +
        '<br>' +
        '<img src="assets/img/tova_down.png" width="800" heigth="auto"></img>',
        // 4
        'Don’t guess where the shape will flash, make sure you see it before you press the button.' + '<br>' +
        '<br>' +
        'Try to balance speed and accuracy : press the button as fast as you can, but also try not to make any mistakes.' + '<br>' +
        '<br>' +
        'If you do make a mistake, don’t worry : anyone can make a mistake on this test.',
        // 5
        'Remember : ' + '<br>' +
        '<br>' +
        `If the shape is presented at the TOP, please press the spacebar.` + '<br>' +
        `If the shape is presented at the BOTTOM, don’t press the spacebar.` + '<br>' +
        'Please be as fast and as accurate as possible.' + '<br>' +
        '<br>' +
        'Click the button "Next" to start the parctice.'
    ],
    show_clickable_nav: true,
    on_finish: function (data) { // change color to black and wait post_instructions_time ms before getting to the first block
        document.body.style.backgroundColor = '#000000';
        jsPsych.pauseExperiment();
        setTimeout(jsPsych.resumeExperiment, post_instructions_time);
    }
}
timeline.push(instructions);

// ########################################################################
// ### define stimuli + their inner variables and trial + its procedure ###
// ########################################################################

var stimuli = [
    { // represents 0 in practice_array
        stimulus: tova_down,
        stim_img: 'shapedown',
        expected_response: '0',
        condition: 'NoGo'
    },
    { // represents 1 in practice_array
        stimulus: tova_up,
        stim_img: 'shapeup',
        expected_response: '1',
        condition: 'Go'
    }
];
var trial = {
    type: jsPsychHtmlKeyboardResponse, // this records RT from the begining of the stim onset, see "../vendor/plugin-html-keyboard-response.js"
    stimulus: jsPsych.timelineVariable('stimulus'), // this will show the 'stimulus'
    choices: [' '], // this is the array of choices
    stimulus_duration: pres_time, // this is the stimulus presentation
    trial_duration: soa, // this is the soa
    response_ends_trial: false, // false means when a response is done, the trial is not stopping
    prompt: function () {
        if (show_fixcross)
            return (fixation_cross); // this show the fixation cross all along
    },
    data: {
        block: '', // is modified at the begining of the block/timeline, see on_timeline_start
        condition: jsPsych.timelineVariable('condition'),
        expected_response: jsPsych.timelineVariable('expected_response'),
        effective_response: '', // is modified at the end of each trial, see "'on_finish' below
    },
    on_finish: function (data) {
        // give to data.stimulus the right label
        data.stimulus = jsPsych.timelineVariable('stim_img');
        // read data.response (= array of key) to give the right number to effective_response
        if (data.response.length >= 2) {
            data.effective_response = 2; // 2 = multiple responses
        } else {
            if (data.response[0]) {
                data.effective_response = 1; // 1 = pressed space
            } else {
                data.effective_response = 0; // 0 = refrained
            }
        }
        // compute data.correct
        data.correct = (data.expected_response == data.effective_response);
    }
};

// ####################################################################
// ### for loop on fixed_blocks_array to create blocks and feedback ###
// ####################################################################

// create block 
var block = {
    timeline_variables: stimuli,
    timeline: [trial], // needs to be an array
    on_timeline_start: function () {
        trial.data.block = 'practice';
    },
    sample: {
        type: 'custom',
        fn: function () {
            return practice_array;
        }
    },
}
timeline.push(block);

// debrief block
var debrief_block = {
    type: jsPsychHtmlKeyboardResponse,
    choices: [' '],
    prompt: function () {

        const trials = jsPsych.data.get().filter({ block: 'practice' });
        const go_trials = trials.filter({ condition: 'Go' });
        const nogo_trials = trials.filter({ condition: 'NoGo' });
        const correct_trials = trials.filter({ correct: true });
        const correct_go_trials = correct_trials.filter({ condition: 'Go' });
        const correct_nogo_trials = correct_trials.filter({ condition: 'NoGo' });
        const go_accuracy = Math.round(correct_go_trials.count() / go_trials.count() * 100);
        const nogo_accuracy = Math.round(correct_nogo_trials.count() / nogo_trials.count() * 100);
        const correct_go_rt = Math.round(correct_go_trials.select('rt').mean());

        return `${endblock_str1}${go_accuracy}${endblock_str2}${nogo_accuracy}${endblock_str3}`;

    },
    on_start: function () {
        document.body.style.backgroundColor = '#202020'; // back to grey
    },
    on_finish: function (data) { // wait post_instructions_time ms before getting to the next block
        jsPsych.pauseExperiment();
        setTimeout(jsPsych.resumeExperiment, post_instructions_time);
    }
}

timeline.push(debrief_block);

// ############################
// ### exit fullscreen mode ###
// ############################

timeline.push({
    type: jsPsychFullscreen,
    fullscreen_mode: false,
    delay_after: 0,
    on_finish: function (data) {
        const date = new Date();
        const month = date.getMonth() + 1 < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1).toString();
        const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate().toString();
        const final = jsPsych.data.get();
        console.log(final.csv()); // can be removed
        final.localSave('csv', data.subject_id + "_blTova_practice_" + date.getFullYear() + month + day + ".csv"); // BACK-END : need to save this csv in the back-end
        window.onbeforeunload = null; // disables the prevention
        window.location.replace("../../bl_tova/index.html?PROLIFIC_PID=" + data.subject_id + "&STUDY_ID=" + data.study_id + "&SESSION_ID=" + data.session_id); // autoredirects to task, whenever the folder of the practice is at the same level than the folder of the task
    }
});

jsPsych.run(timeline);