import ApiBridge from "./apiBridge.js";
import { SubPub } from "./subpub.js";


export const State = {

    get local() {
        let _localState = localStorage.getItem("localState");
        if (!_localState) {
            _localState = {
                currentView: "home",
            };
            this.updateLocal(_localState);
            return _localState;
        } else {
            _localState = JSON.parse(_localState);
        }
        return _localState;
    },

    updateLocal(ls) {
        let __ = JSON.parse(localStorage.getItem("localState") || "{}");
        localStorage.setItem("localState", JSON.stringify({ ...__, ...ls }));
    },

    updateTimeLeft: function(timeLeft) {
        let local = this.local;
        let serverPhase = {...local.serverPhase, timeLeft};
        this.updateLocal({ ...local, serverPhase });
    },

};


SubPub.subscribe({
    event: "event::user:login:success",
    listener: function (response) {
        let { userName, userID, token, toneics, joinedTeamID, joinedTeamName } = response.payload.data;
        State.updateLocal({ userName, userID, token, toneics, joinedTeamID, joinedTeamName });
    }
});

SubPub.subscribe({
    event: "event::register:user:success",
    listener: function (response) {
        State.updateLocal(response.payload.data);
    }
});

SubPub.subscribe({
    event: "event::serverPhase:success",
    listener: (response) => {
        let { toneicID, phase, timeLeft } = response.payload.data;
        State.updateLocal({
            currentToneicID: toneicID,
            serverPhase: { phase, timeLeft },
        });
    }
});

SubPub.subscribe({
    event: "event::team:join:success",
    listener: (response) => {
        let { teamName, teamID } = response.payload.data;
        State.updateLocal({ 
            joinedTeamID: teamID,
            joinedTeamName: teamName
        });
    }
});


function getDateInfo () {
    // https://weeknumber.com/how-to/javascript
    // Returns the ISO week of the date.
 
    let date = new Date(Date.now());
 
    let year = date.getFullYear().toString().substr(2);
 
    date.setHours(0, 0, 0, 0);
 
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
 
    // January 4 is always in week 1.
    let week1 = new Date(date.getFullYear(), 0, 4);
 
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    let weekNumber =  1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                         - 3 + (week1.getDay() + 6) % 7) / 7);
  
    return { year, weekNumber };
 }
 function toneicWeek () {
       let date = getDateInfo();
       return `${date.year}v${date.weekNumber}`;
 }