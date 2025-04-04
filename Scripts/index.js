const inpID = document.getElementById('inpID');

const outPDF = document.getElementById('outPDF');

const divFuel = document.getElementById('divFuel');
const txtTaxiFuel = document.getElementById('txtTaxiFuel');
const txtTaxiTime = document.getElementById('txtTaxiTime');
const txtTripFuel = document.getElementById('txtTripFuel');
const txtTripTime = document.getElementById('txtTripTime');
const lblCont = document.getElementById('lblCont');
const txtContFuel = document.getElementById('txtContFuel');
const txtContTime = document.getElementById('txtContTime');
const inpAltns = document.getElementById('inpAltns');
const txtAltnFuel = document.getElementById('txtAltnFuel');
const txtAltnTime = document.getElementById('txtAltnTime');
const txtFinResFuel = document.getElementById('txtFinResFuel');
const txtResTime = document.getElementById('txtResTime');
const txtPlnBlkFuel = document.getElementById('txtPlnBlkFuel');
const txtPlanTime = document.getElementById('txtPlanTime');
const inpTankFuel = document.getElementById('inpTankFuel');
const spnTankFuel = document.getElementById('spnTankFuel');
const txtTankTime = document.getElementById('txtTankTime');
const discList = document.getElementById('disc_list');
const butDiscAdd = document.getElementById('butDiscAdd');
const txtFnlBlkFuel = document.getElementById('txtFnlBlkFuel');
const txtFinalTime = document.getElementById('txtFinalTime');

const inpActFuel = document.getElementById('inpActFuel');
const inpOutTime = document.getElementById('inpOut');
const inpOffTime = document.getElementById('inpOff');
const inpOnTime = document.getElementById('inpOn');
const inpInTime = document.getElementById('inpIn');

var smbrfID = "";
var units = " kg"
var flightData;
var fuelData;
var liveData;

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function FormatDate(seconds) {
    const date = new Date(seconds * 1000);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    return `${day}${month}`;
}

function GoHome() {
    document.getElementById('divOFP').style = "display: none;";
    document.getElementById('divPlnFuel').style = "display: none;";
    document.getElementById('divActFuel').style = "display: none;";
    document.getElementById('divNavLog').style = "display: none;";


    document.getElementById('divHome').style = "display: block;";
}

function GoOFP() {
    document.getElementById('divHome').style = "display: none;";
    document.getElementById('divActFuel').style = "display: none;";
    document.getElementById('divPlnFuel').style = "display: none;";
    document.getElementById('divNavLog').style = "display: none;";


    document.getElementById('divOFP').style = "display: block;";
}

function GoPlnFuel() {
    document.getElementById('divHome').style = "display: none;";
    document.getElementById('divOFP').style = "display: none;";
    document.getElementById('divActFuel').style = "display: none;";
    document.getElementById('divNavLog').style = "display: none;";


    document.getElementById('divPlnFuel').style = "display: block;";
}

function GoActFuel() {
    document.getElementById('divHome').style = "display: none;";
    document.getElementById('divOFP').style = "display: none;";
    document.getElementById('divPlnFuel').style = "display: none;";
    document.getElementById('divNavLog').style = "display: none;";


    document.getElementById('divActFuel').style = "display: block;";
}

function GoNavLog() {
    document.getElementById('divHome').style = "display: none;";
    document.getElementById('divOFP').style = "display: none;";
    document.getElementById('divPlnFuel').style = "display: none;";
    document.getElementById('divActFuel').style = "display: none;";


    document.getElementById('divNavLog').style = "display: block;";
    GetNavLog();
}

function LoadPage() {
    inpID.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            const inputValue = inpID.value;
            SetSimbriefID(inputValue);
            inpID.blur();
        }
    });

    let id_cookie = getCookie("simbrief_id");
    if (id_cookie != "")
        smbrfID = id_cookie;
    else smbrfID = "";

    if (smbrfID == "") {
        console.error("There is no Simbrief ID.");
        return;
    }
    inpID.value = smbrfID;

    flightData = JSON.parse(localStorage.getItem('flight_data'));
    fuelData = JSON.parse(localStorage.getItem('fuel_data'));
    liveData = JSON.parse(localStorage.getItem('live_data'));

    if (flightData == null || isEmpty(flightData))
        return;

    let date = FormatDate(flightData.api_params.date);
    let fltID = "Flight - ";
    if (!isEmpty(flightData.general.icao_airline))
        fltID = "Flight - #" + flightData.general.icao_airline + flightData.general.flight_number + "/" + date + "(" + flightData.general.release + ")";
    else
        fltID = "Flight - " + flightData.general.flight_number + "/" + date + "(" + flightData.general.release + ")";

    fltID += ": " + flightData.origin.iata_code + "-" + flightData.destination.iata_code;
    console.log(fltID);
    document.getElementById("txtFltID").innerHTML = fltID;

    GetPDF();
    GetFuelPlan();
    GetActFuel();
    GetNavLog();
}

function ResetPage() {
    console.log('ResetPage');

    ResetPDF();
    ResetFuelPlan();
    ResetLiveData();
    ResetNavlog();
}
function ResetPDF() {
    console.log('ResetPDF');

    outPDF.src = "";
}
function ResetFuelPlan() {
    console.log('ResetFuelPlan');

    txtTaxiFuel.innerHTML = "- kg";
    txtTaxiTime.innerHTML = "00:00";
    txtTripFuel.innerHTML = "- kg";
    txtTripTime.innerHTML = "00:00";
    lblCont.innerHTML = "Contingency:";
    txtContFuel.innerHTML = "- kg";
    txtContTime.innerHTML = "00:00";
    while (inpAltns.firstChild)
        inpAltns.removeChild(inpAltns.firstChild);
    txtAltnFuel.innerHTML = "- kg";
    txtAltnTime.innerHTML = "00:00";
    txtFinResFuel.innerHTML = "- kg";
    txtResTime.innerHTML = "00:00";
    txtPlnBlkFuel.innerHTML = "- kg";
    txtPlanTime.innerHTML = "00:00";
    txtFnlBlkFuel.innerHTML = "- kg";
    txtFinalTime.innerHTML = "00:00";

    inpAltns.disabled = true;
    inpAltns.value = "";
    inpTankFuel.disabled = true;
    inpTankFuel.value = "";
    butDiscAdd.disabled = true;

    while (discList.firstChild)
        discList.removeChild(discList.firstChild);

    UpdateZFWGauge(0, 1);
    UpdateTOWGauge(0, 1);
    UpdateLWGauge(0, 1);
}
function ResetLiveData() {
    console.log('ResetLiveData');

    inpActFuel.disabled = true;
    inpActFuel.placeholder = "Actual Fuel";
    inpActFuel.value = "";
    inpOutTime.disabled = true;
    inpOutTime.value = "";
    inpOffTime.disabled = true;
    inpOffTime.value = "";
    inpOnTime.disabled = true;
    inpOnTime.value = "";
    inpInTime.disabled = true;
    inpInTime.value = "";
}
function ResetNavlog() {
    console.log('ResetNavlog');

    const legList = document.getElementById('legList');
    while (legList.firstChild)
        legList.removeChild(legList.firstChild);
}

function ResetData() {
    console.log('ResetData');

    flightData = {};
    fuelData = {};
    liveData = {};
    units = " kg";
    localStorage.removeItem('flight_data');
    localStorage.removeItem('fuel_data');
    localStorage.removeItem('live_data');

    inpID.value = "";
    document.getElementById("txtFltID").innerHTML = "Flight";
    smbrfID = "";
    document.cookie = "simbrief_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function SetSimbriefID(id) {
    if (id != null && id != "") {
        smbrfID = id;
        setCookie("simbrief_id", smbrfID, 30);

        ResetPage();
        FetchSimbriefAPI();
    } else {
        smbrfID = "";
        ResetData();
        ResetPage();
    }
}

function FetchSimbriefAPI() {
    console.log("Fetching flightData from Simbrief.", smbrfID);

    //https://www.simbrief.com/api/xml.fetcher.php?userid=xxxxxx&json=1
    //https://www.simbrief.com/api/xml.fetcher.php?username=xxxxxx&json=1
    let url = 'https://www.simbrief.com/api/xml.fetcher.php?userid=';
    if (isNaN(smbrfID) || smbrfID > 999999)
        url = 'https://www.simbrief.com/api/xml.fetcher.php?username='
    url += smbrfID + "&json=1";

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            SetFlightData(data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function SetFlightData(data) {
    flightData = data;

    fuelData = flightData.fuel;
    fuelData.tank = "0";
    fuelData.final_ramp = fuelData.plan_ramp;
    if (flightData.params.units == "kgs")
        units = " kg";
    else
        units = " lb";

    liveData = {
        dep_fuel: "",
        out_time: "",
        off_time: "",
        on_time: "",
        in_time: ""
    };

    localStorage.setItem('flight_data', JSON.stringify(flightData));
    localStorage.setItem('fuel_data', JSON.stringify(fuelData));
    localStorage.setItem('live_data', JSON.stringify(liveData));

    let date = FormatDate(flightData.api_params.date);
    let fltID = "Flight - ";
    if (!isEmpty(flightData.general.icao_airline))
        fltID = "Flight - #" + flightData.general.icao_airline + flightData.general.flight_number + "/" + date + "(" + flightData.general.release + ")";
    else
        fltID = "Flight - " + flightData.general.flight_number + "/" + date + "(" + flightData.general.release + ")";

    fltID += ": " + flightData.origin.iata_code + "-" + flightData.destination.iata_code;
    console.log(fltID);
    document.getElementById("txtFltID").innerHTML = fltID;

    GetPDF();
    GetFuelPlan();
    GetActFuel();
    GetNavLog();
}

function GetPDF() {
    console.log('GetPDF.');

    const dir = "https://docs.google.com/gview?url=" + flightData.files.directory + flightData.files.pdf.link + "&embedded=true";
    outPDF.src = dir;
}

function FormatFuelTime(seconds) {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let HH = String(hours).padStart(2, '0');
    let MM = String(minutes).padStart(2, '0');
    return `${HH}:${MM}`;
}

function GetFuelPlan() {
    console.log('GetFuelPlan');

    txtTaxiFuel.innerHTML = fuelData.taxi + units;
    txtTaxiTime.innerHTML = FormatFuelTime(flightData.times.taxi_out);
    txtTripFuel.innerHTML = fuelData.enroute_burn + units;
    txtTripTime.innerHTML = FormatFuelTime(flightData.times.est_time_enroute);
    txtAltnFuel.innerHTML = fuelData.alternate_burn + units;
    lblCont.innerHTML = "Contingency: " + flightData.general.cont_rule;
    txtContFuel.innerHTML = fuelData.contingency + units;
    txtContTime.innerHTML = FormatFuelTime(flightData.times.contfuel_time);
    txtFinResFuel.innerHTML = fuelData.reserve + units;
    txtResTime.innerHTML = FormatFuelTime(flightData.times.reserve_time);
    txtPlnBlkFuel.innerHTML = fuelData.plan_ramp + units;
    txtFnlBlkFuel.innerHTML = fuelData.final_ramp + units;

    inpAltns.disabled = false;
    inpAltns.addEventListener("change", UpdateFuelPlan);
    if (flightData.alternate.length == null) {
        let obj = flightData.alternate;

        var opt = document.createElement('option');
        opt.value = 0;
        opt.innerHTML = obj.icao_code;
        inpAltns.appendChild(opt);
    } else {
        for (let i = 0; i < flightData.alternate.length; i++) {
            let obj = flightData.alternate[i];

            var opt = document.createElement('option');
            opt.value = i;
            opt.innerHTML = obj.icao_code;
            inpAltns.appendChild(opt);
            if (flightData.select_alternate == i) {
                inpAltns.value = i;
            }
        }
    }
    if (inpAltns.options.length == 0)
        inpAltns.disabled = true;

    let selAltn = 0;
    if (flightData.select_alternate != null)
        selAltn = flightData.select_alternate;
    if (flightData.alternate.length != null) {
        txtAltnTime.innerHTML = FormatFuelTime(flightData.alternate[selAltn].ete);
    } else {
        txtAltnTime.innerHTML = FormatFuelTime(flightData.alternate.ete);
    }

    let plnTime = 0;
    plnTime = Number(flightData.times.taxi_out) + Number(flightData.times.est_time_enroute) + Number(flightData.times.contfuel_time) + Number(flightData.times.reserve_time);
    if (flightData.alternate.length != null) {
        plnTime += Number(flightData.alternate[selAltn].ete);
    } else {
        plnTime += Number(flightData.alternate.ete);
    }
    flightData.times.endurance = plnTime.toString();
    txtPlanTime.innerHTML = FormatFuelTime(flightData.times.endurance);

    inpTankFuel.disabled = false;
    inpTankFuel.addEventListener("keyup", UpdateFuelPlan);
    if (fuelData.tank != null && fuelData.tank != "0")
        inpTankFuel.value = fuelData.tank;
    if (units == " lb")
        spnTankFuel.innerHTML = "lb";

    let tankTime = 0;
    if (fuelData.tank != "0") {
        tankTime = fuelData.tank / fuelData.avg_fuel_flow;
        tankTime *= (60 * 60);
    }
    txtTankTime.innerHTML = FormatFuelTime(tankTime);

    let disc_total_time = 0;
    if (fuelData.discretionary != null) {
        for (var i = 0; i < fuelData.discretionary.length; i++) {
            let disc = fuelData.discretionary[i];

            AddDiscRow(i);
            document.getElementById('inpDiscRes' + i.toString()).value = disc.reason;
            const inp = document.getElementById('inpDiscFuel' + i.toString());
            if (disc.amount != "0")
                inp.value = disc.amount;

            let discTime = document.getElementById("txtDiscTime" + i.toString());
            let time = 0;
            if (fuelData.discretionary[i].amount != "0") {
                time = fuelData.discretionary[i].amount / fuelData.avg_fuel_flow;
                time *= (60 * 60);
                disc_total_time += time;
            }
            discTime.innerHTML = FormatFuelTime(time);
        }
    }
    butDiscAdd.disabled = false;

    let finalTime = plnTime;
    finalTime += tankTime + disc_total_time;
    txtFinalTime.innerHTML = FormatFuelTime(finalTime);

    let zfw = Number(flightData.weights.est_zfw);
    flightData.weights.est_tow = zfw + (Number(fuelData.final_ramp) - Number(fuelData.taxi));
    flightData.weights.est_ldw = Number(flightData.weights.est_tow) - Number(fuelData.enroute_burn);

    UpdateZFWGauge(flightData.weights.est_zfw, flightData.weights.max_zfw);
    UpdateTOWGauge(flightData.weights.est_tow, flightData.weights.max_tow);
    UpdateLWGauge(flightData.weights.est_ldw, flightData.weights.max_ldw);
}

function UpdateFuelPlan() {
    if (flightData.alternate.length == null) {
        fuelData.alternate_burn = flightData.alternate.burn;
    } else {
        fuelData.alternate_burn = flightData.alternate[inpAltns.value].burn;
        flightData.select_alternate = inpAltns.value.toString();
    }
    txtAltnFuel.innerHTML = fuelData.alternate_burn + units;

    // update min_takeoff
    let min_takeoff = Number(fuelData.enroute_burn) + Number(fuelData.contingency)
        + Number(fuelData.alternate_burn) + Number(fuelData.reserve)
        + Number(fuelData.etops) + Number(fuelData.extra)
        + Number(fuelData.extra_required) + Number(fuelData.extra_optional);
    fuelData.min_takeoff = min_takeoff.toString();

    // update plan_takeoff
    fuelData.plan_takeoff = fuelData.min_takeoff;
    // update plan_ramp
    let plan_ramp = Number(fuelData.plan_takeoff) + Number(fuelData.taxi);
    fuelData.plan_ramp = plan_ramp.toString();
    // update plan_landing
    let plan_landing = Number(fuelData.plan_takeoff) - Number(fuelData.enroute_burn);
    fuelData.plan_landing = plan_landing.toString();

    txtPlnBlkFuel.innerHTML = fuelData.plan_ramp + units;

    let selAltn = 0;
    if (flightData.select_alternate != null)
        selAltn = flightData.select_alternate;
    if (flightData.select_alternate != null) {
        txtAltnTime.innerHTML = FormatFuelTime(flightData.alternate[selAltn].ete);
    } else {
        txtAltnTime.innerHTML = FormatFuelTime(flightData.alternate.ete);
    }

    let plnTime = 0;
    plnTime = Number(flightData.times.taxi_out) + Number(flightData.times.est_time_enroute) + Number(flightData.times.contfuel_time) + Number(flightData.times.reserve_time);
    if (flightData.select_alternate != null) {
        plnTime += Number(flightData.alternate[selAltn].ete);
    } else {
        plnTime += Number(flightData.alternate.ete);
    }
    flightData.times.endurance = plnTime.toString();
    txtPlanTime.innerHTML = FormatFuelTime(flightData.times.endurance);

    // update tankering value
    if (inpTankFuel.value != "") {
        fuelData.tank = inpTankFuel.value.toString();
    } else {
        fuelData.tank = "0";
    }

    let tankTime = 0;
    if (fuelData.tank != "0") {
        tankTime = fuelData.tank / fuelData.avg_fuel_flow;
        tankTime *= (60 * 60);
    }
    txtTankTime.innerHTML = FormatFuelTime(tankTime);

    // update disc fuels
    let disc_total_time = 0;
    if (fuelData.discretionary != null) {
        for (var i = 0; i < fuelData.discretionary.length; i++) {
            let discSel = document.getElementById("inpDiscRes" + i.toString());
            let discInp = document.getElementById("inpDiscFuel" + i.toString());
            let discTime = document.getElementById("txtDiscTime" + i.toString());

            discSel.reason = fuelData.discretionary[i].reason;
            if (discInp.value != "") {
                fuelData.discretionary[i].amount = discInp.value;
            } else {
                fuelData.discretionary[i].amount = "0";
            }

            let time = 0;
            if (fuelData.discretionary[i].amount != "0") {
                time = fuelData.discretionary[i].amount / fuelData.avg_fuel_flow;
                time *= (60 * 60);
                disc_total_time += time;
            }
            discTime.innerHTML = FormatFuelTime(time);
        }
    }

    // update final_ramp (includes tank+disc)
    fuelData.final_ramp = Number(fuelData.plan_ramp) + Number(fuelData.tank);

    let disc = 0;
    if (fuelData.discretionary != null) {
        for (var i = 0; i < fuelData.discretionary.length; i++) {
            disc += Number(fuelData.discretionary[i].amount);
        }
    }

    fuelData.final_ramp += disc;
    fuelData.final_ramp = fuelData.final_ramp.toString();

    txtFnlBlkFuel.innerHTML = fuelData.final_ramp + units;

    let finalTime = plnTime;
    finalTime += tankTime + disc_total_time;
    txtFinalTime.innerHTML = FormatFuelTime(finalTime);

    let zfw = Number(flightData.weights.est_zfw);
    flightData.weights.est_tow = zfw + (Number(fuelData.final_ramp) - Number(fuelData.taxi));
    flightData.weights.est_ldw = Number(flightData.weights.est_tow) - Number(fuelData.enroute_burn);

    UpdateZFWGauge(flightData.weights.est_zfw, flightData.weights.max_zfw);
    UpdateTOWGauge(flightData.weights.est_tow, flightData.weights.max_tow);
    UpdateLWGauge(flightData.weights.est_ldw, flightData.weights.max_ldw);

    inpActFuel.placeholder = fuelData.final_ramp.toString();

    localStorage.setItem('flight_data', JSON.stringify(flightData));
    localStorage.setItem('fuel_data', JSON.stringify(fuelData));
}

function AddDiscRow(idx) {
    var list = document.getElementById('disc_list');

    var newRow = document.createElement('div');
    newRow.className = 'table-row';
    newRow.id = "divDisc" + idx.toString();

    var newDel = document.createElement('a');
    newDel.className = 'close'
    newRow.append(newDel);

    var newHeader = document.createElement('h3');
    newHeader.id = "txtDisc";
    newHeader.innerHTML = "Discretionary";
    newRow.append(newHeader);

    var newSel = document.createElement('select');
    newSel.id = "inpDiscRes" + idx.toString();
    newSel.style = "margin-top: auto; margin-bottom: auto;";

    var optDis = document.createElement('option');
    optDis.disabled = true;
    optDis.value = "";
    optDis.innerHTML = "Reason";
    optDis.selected = true;
    optDis.hidden = true;
    newSel.appendChild(optDis);

    var optWxr = document.createElement('option');
    optWxr.value = "weather";
    optWxr.innerHTML = "Weather";
    newSel.appendChild(optWxr);
    var optAtc = document.createElement('option');
    optAtc.value = "atc";
    optAtc.innerHTML = "ATC"
    newSel.appendChild(optAtc);
    var optOthr = document.createElement('option');
    optOthr.value = "other";
    optOthr.innerHTML = "Other"
    newSel.appendChild(optOthr);

    newRow.append(newSel);

    var newDiv = document.createElement('div');
    newDiv.className = "fuel-inp-div";

    var newInp = document.createElement('input');
    newInp.id = "inpDiscFuel" + idx.toString();
    newInp.className = "fuel-inp";
    newInp.type = "text";
    newInp.inputMode = "numeric";
    newInp.placeholder = "-"
    newInp.maxLength = "6";
    newInp.oninput = function () { this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'); };

    var newSpan = document.createElement('span');
    newSpan.id = "spnDiscFuel" + idx.toString();
    newSpan.className = "fuel-inp-span";
    if (units == " kg")
        newSpan.innerHTML = "kg";
    else
        newSpan.innerHTML = "lb";

    newDiv.appendChild(newInp);
    newDiv.appendChild(newSpan);

    newRow.appendChild(newDiv);

    var newP = document.createElement('p');
    newP.className = 'fuel-time';
    newP.innerHTML = "00:00";
    newP.id = "txtDiscTime" + idx.toString();
    newRow.appendChild(newP);

    list.appendChild(newRow);

    newSel.addEventListener('change', function (event) {
        UpdateDiscReason(idx, newSel.value);
    });
    newInp.addEventListener("keyup", UpdateFuelPlan);

    newDel.addEventListener("click", function (event) {
        RemoveDiscFuel(idx);
    });
}

function AddDiscFuel() {
    if (fuelData.discretionary == null)
        fuelData.discretionary = new Array

    let obj = {
        reason: "",
        amount: "0"
    };
    fuelData.discretionary.push(obj);

    AddDiscRow(fuelData.discretionary.length - 1);

    divFuel.scrollTop = divFuel.scrollHeight;

    localStorage.setItem('fuel_data', JSON.stringify(fuelData));
}

function RemoveDiscFuel(idx) {
    for (var i = 0; i < fuelData.discretionary.length; i++) {
        const element = document.getElementById("divDisc" + i.toString());
        element.remove();
    }

    fuelData.discretionary.splice(idx, 1);

    for (var i = 0; i < fuelData.discretionary.length; i++) {
        let disc = fuelData.discretionary[i];

        AddDiscRow(i);
        document.getElementById('inpDiscRes' + i.toString()).value = disc.reason;
        let inp = document.getElementById('inpDiscFuel' + i.toString());
        if (disc.amount != "0")
            inp.value = disc.amount;
    }
    UpdateFuelPlan();
}

function UpdateDiscReason(idx, value) {
    if (value == "") return;

    fuelData.discretionary[idx].reason = value.toString();
    localStorage.setItem('fuel_data', JSON.stringify(fuelData));
}

function UpdateZFWGauge(val, max_val) {
    let percent = (Number(val) / Number(max_val)) * 100;
    percent = Math.round(percent);

    let ang = 360 * (percent / 100);

    let colour = "green";
    if (percent >= 90)
        colour = "orange"
    if (percent > 100) {
        colour = "red";
        ang = 360;
    }

    let el = document.getElementById('arcZFW')
    el.style.backgroundImage =
        `radial-gradient(#fff 0, #fff 60%, transparent 60%), 
         conic-gradient(${colour} ${ang}deg, #ccc ${ang}deg)`;

    el = document.getElementById('txtZFW');
    el.innerHTML = percent + "%";
}
function UpdateTOWGauge(val, max_val) {
    let percent = (Number(val) / Number(max_val)) * 100;
    percent = Math.round(percent);

    let ang = 360 * (percent / 100);

    let colour = "green";
    if (percent >= 90)
        colour = "orange"
    if (percent > 100) {
        colour = "red";
        ang = 360;
    }

    let el = document.getElementById('arcTOW')
    el.style.backgroundImage =
        `radial-gradient(#fff 0, #fff 60%, transparent 60%), 
         conic-gradient(${colour} ${ang}deg, #ccc ${ang}deg)`;

    el = document.getElementById('txtTOW');
    el.innerHTML = percent + "%";
}
function UpdateLWGauge(val, max_val) {
    let percent = (Number(val) / Number(max_val)) * 100;
    percent = Math.round(percent);

    let ang = 360 * (percent / 100);

    let colour = "green";
    if (percent >= 90)
        colour = "orange"
    if (percent > 100) {
        colour = "red";
        ang = 360;
    }

    let el = document.getElementById('arcLW')
    el.style.backgroundImage =
        `radial-gradient(#fff 0, #fff 60%, transparent 60%), 
         conic-gradient(${colour} ${ang}deg, #ccc ${ang}deg)`;

    el = document.getElementById('txtLW');
    el.innerHTML = percent + "%";
}

function GetActFuel() {
    console.log('GetActFuel');

    inpActFuel.disabled = false;
    inpActFuel.placeholder = fuelData.final_ramp.toString();
    if (liveData.dep_fuel != "")
        inpActFuel.value = liveData.dep_fuel.toString();
    inpActFuel.addEventListener('focusout', function (event) {
        liveData.dep_fuel = this.value;
        UpdateNavLog();
    });
    inpActFuel.addEventListener('keydown', function (event) {
        if (event.key === 'Enter')
            this.blur();
    });

    inpOutTime.disabled = false;
    if (liveData.out_time != "")
        inpOutTime.value = liveData.out_time.toString();
    inpOutTime.addEventListener('focusout', function (event) {
        liveData.out_time = this.value;
        UpdateNavLog();
    });
    inpOutTime.addEventListener('keydown', function (event) {
        if (event.key === 'Enter')
            this.blur();
    });
    inpOutTime.oninput = function () {
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value.length >= 2) {
            let hours = parseInt(this.value.slice(0, 2), 10);
            let minutes = parseInt(this.value.slice(2), 10);
            if (hours > 23 || minutes > 59) {
                this.value = this.value.slice(0, -1);
            }
        }
    };

    inpOffTime.disabled = false;
    if (liveData.off_time != "")
        inpOffTime.value = liveData.off_time.toString();
    inpOffTime.addEventListener('focusout', function (event) {
        liveData.off_time = this.value;
        UpdateNavLog();
    });
    inpOffTime.addEventListener('keydown', function (event) {
        if (event.key === 'Enter')
            this.blur();
    });
    inpOffTime.oninput = function () {
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value.length >= 2) {
            let hours = parseInt(this.value.slice(0, 2), 10);
            let minutes = parseInt(this.value.slice(2), 10);
            if (hours > 23 || minutes > 59) {
                this.value = this.value.slice(0, -1);
            }
        }
    };

    inpOnTime.disabled = false;
    if (liveData.on_time != "")
        inpOnTime.value = liveData.on_time.toString();
    inpOnTime.addEventListener('focusout', function (event) {
        liveData.on_time = this.value;
        let last_leg = flightData.navlog.fix[flightData.navlog.fix.length - 1];
        UpdateLegTime(last_leg, this.value);
        UpdateNavLog();
    });
    inpOnTime.addEventListener('keydown', function (event) {
        if (event.key === 'Enter')
            this.blur();
    });
    inpOnTime.oninput = function () {
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value.length >= 2) {
            let hours = parseInt(this.value.slice(0, 2), 10);
            let minutes = parseInt(this.value.slice(2), 10);
            if (hours > 23 || minutes > 59) {
                this.value = this.value.slice(0, -1);
            }
        }
    };

    inpInTime.disabled = false;
    if (liveData.in_time != "")
        inpInTime.value = liveData.in_time.toString();
    inpInTime.addEventListener('focusout', function (event) {
        liveData.in_time = this.value;
        UpdateNavLog();
    });
    inpInTime.addEventListener('keydown', function (event) {
        if (event.key === 'Enter')
            this.blur();
    });
    inpInTime.oninput = function () {
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value.length >= 2) {
            let hours = parseInt(this.value.slice(0, 2), 10);
            let minutes = parseInt(this.value.slice(2), 10);
            if (hours > 23 || minutes > 59) {
                this.value = this.value.slice(0, -1);
            }
        }
    };
}

function UpdateNavLog() {
    let min_dep_fuel = Number(fuelData.min_takeoff) - Number(fuelData.contingency);
    let dep_fuel = Number(fuelData.final_ramp);
    if (liveData != null && liveData.dep_fuel != "" && Number(liveData.dep_fuel) != 0)
        dep_fuel = Number(liveData.dep_fuel);

    dep_fuel -= fuelData.taxi
    let fuel_use = 0

    let atd = Number(flightData.api_params.dephour) + Number(flightData.api_params.depmin) + (Number(flightData.api_params.taxiout) * 60);
    if (liveData != null && liveData.off_time != "")
        atd = FormatToSeconds(liveData.off_time);

    for (let i = 0; i < flightData.navlog.fix.length; i++) {
        let leg = flightData.navlog.fix[i];
        fuel_use = Number(leg.fuel_totalused);

        leg.fuel_min_onboard = (min_dep_fuel - fuel_use).toString();
        leg.fuel_plan_onboard = (dep_fuel - fuel_use).toString();

        leg.fpeto = (atd + Number(leg.time_total)).toString();
    }

    localStorage.setItem('flight_data', JSON.stringify(flightData));
    localStorage.setItem('live_data', JSON.stringify(liveData));
}

function GetNavLog() {
    console.log('GetNavLog');

    const legList = document.getElementById('legList');
    while (legList.firstChild)
        legList.removeChild(legList.firstChild);

    if (flightData == null || isEmpty(flightData))
        return;

    UpdateNavLog();

    let std = Number(flightData.api_params.dephour) + Number(flightData.api_params.depmin) + (Number(flightData.api_params.taxiout) * 60);
    for (let i = 0; i < flightData.navlog.fix.length; i++) {
        let leg = flightData.navlog.fix[i];

        AddLegRow(std, leg);
    }
}

function FormatLegTime(seconds) {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.ceil((seconds % 3600) / 60);
    let HH = String(hours).padStart(2, '0');
    let MM = String(minutes).padStart(2, '0');
    return `${HH}${MM}`;
}
function FormatToSeconds(timeStr) {
    if (!/^\d{4}$/.test(timeStr)) {
        throw new Error("Invalid time format. Use 'HHMM'.");
    }

    let hours = parseInt(timeStr.substring(0, 2), 10);
    let minutes = parseInt(timeStr.substring(2, 4), 10);

    return (hours * 3600) + (minutes * 60);
}

function AddLegRow(std, leg) {
    var list = document.getElementById('legList');

    var newRow = document.createElement('div');
    newRow.className = 'leg-row';

    var newDiv = document.createElement('div');
    newDiv.style = 'width: 100%; display: flex;';

    var newName = document.createElement('div');
    newName.className = 'leg-ident'
    newName.innerHTML = leg.ident;
    newDiv.appendChild(newName);

    if (leg.ident != leg.name) {
        newName = document.createElement('div');
        newName.className = 'leg-name'
        newName.innerHTML = leg.name;
        newDiv.appendChild(newName);
    }

    newName = document.createElement('div');
    newName.className = 'leg-airway'
    newName.innerHTML = leg.via_airway;
    newDiv.appendChild(newName);

    newRow.appendChild(newDiv);

    newDiv = document.createElement('div');
    newDiv.style = 'width: 100%; display: flex;';

    var newBox = document.createElement('div');
    newBox.className = 'leg-box'
    var newLabel = document.createElement('label');
    newLabel.className = 'leg-row-label';
    newLabel.innerHTML = 'EET';
    newBox.appendChild(newLabel);
    var newP = document.createElement('p');
    newP.innerHTML = FormatLegTime(leg.time_leg);
    newBox.appendChild(newP);
    newDiv.appendChild(newBox);

    newBox = document.createElement('div');
    newBox.className = 'leg-box'
    newLabel = document.createElement('label');
    newLabel.className = 'leg-row-label';
    newLabel.innerHTML = 'ETO';
    newBox.appendChild(newLabel);
    newP = document.createElement('p');

    let eto = std + Number(leg.time_total);
    while (eto >= 86400)
        eto -= 86400;
    newP.innerHTML = FormatLegTime(eto);
    newBox.appendChild(newP);
    newDiv.appendChild(newBox);

    newBox = document.createElement('div');
    newBox.className = 'leg-box'
    newLabel = document.createElement('label');
    newLabel.className = 'leg-row-label';
    newLabel.innerHTML = 'EFOB';
    newBox.appendChild(newLabel);
    newP = document.createElement('p');
    newP.innerHTML = leg.fuel_plan_onboard;
    newBox.appendChild(newP);
    newDiv.appendChild(newBox);

    newBox = document.createElement('div');
    newBox.className = 'leg-box'
    newLabel = document.createElement('label');
    newLabel.className = 'leg-row-label';
    newLabel.innerHTML = 'MFOB';
    newBox.appendChild(newLabel);
    newP = document.createElement('p');
    newP.innerHTML = leg.fuel_min_onboard;
    newBox.appendChild(newP);
    newDiv.appendChild(newBox);

    newRow.appendChild(newDiv);

    newDiv = document.createElement('div');
    newDiv.style = 'width: 100%; display: flex;';

    newBox = document.createElement('div');
    newBox.className = 'leg-box'
    newLabel = document.createElement('label');
    newLabel.className = 'leg-row-label';
    newLabel.innerHTML = 'TTLT';
    newBox.appendChild(newLabel);
    newP = document.createElement('p');
    newP.innerHTML = FormatLegTime(leg.time_total);
    newBox.appendChild(newP);
    newDiv.appendChild(newBox);

    newBox = document.createElement('div');
    newBox.className = 'leg-box'
    newLabel = document.createElement('label');
    newLabel.className = 'leg-row-label';
    newLabel.innerHTML = 'ATO';
    newBox.appendChild(newLabel);

    let newInp = document.createElement('input');
    newInp.id = 'inpTime' + leg.ident + eto;
    newInp.type = "text";
    newInp.inputMode = "numeric";
    newInp.placeholder = '-';
    newInp.maxLength = '4';
    newInp.oninput = function () {
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value.length >= 2) {
            let hours = parseInt(this.value.slice(0, 2), 10);
            let minutes = parseInt(this.value.slice(2), 10);
            if (hours > 23 || minutes > 59) {
                this.value = this.value.slice(0, -1);
            }
        }
    };
    if (leg.ato != null)
        newInp.value = leg.ato.toString();
    newBox.appendChild(newInp);
    newDiv.appendChild(newBox);

    newInp.addEventListener('focusout', function (event) {
        UpdateLegTime(leg, this.value);
        UpdateInputLabel(this, leg.diff_time);
    });
    newInp.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            const nextInput = document.getElementById('inpFuel' + leg.ident + eto);
            if (nextInput && this.value != "")
                nextInput.focus();
            this.blur();
        }
    });

    if (leg.diff_time != null)
        UpdateInputLabel(newInp, leg.diff_time);

    newBox = document.createElement('div');
    newBox.className = 'leg-box'
    newLabel = document.createElement('label');
    newLabel.className = 'leg-row-label';
    newLabel.innerHTML = 'AFOB';
    newBox.appendChild(newLabel);
    newInp = document.createElement('input');
    newInp.id = 'inpFuel' + leg.ident + eto;
    newInp.type = "text";
    newInp.inputMode = "numeric";
    newInp.placeholder = '-';
    newInp.maxLength = '6';
    newInp.oninput = function () {
        this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    };
    if (leg.afob != null)
        newInp.value = leg.afob.toString();
    newBox.appendChild(newInp);
    newDiv.appendChild(newBox);

    newInp.addEventListener('focusout', function (even) {
        UpdateLegFuel(leg, Number(this.value));
        UpdateInputLabel(this, leg.diff_fuel);
    });
    newInp.addEventListener('keydown', function (event) {
        if (event.key === 'Enter')
            this.blur();
    });

    if (leg.diff_fuel != null)
        UpdateInputLabel(newInp, leg.diff_fuel);

    newBox = document.createElement('div');
    newBox.className = 'leg-box'
    newLabel = document.createElement('label');
    newLabel.className = 'leg-row-label';
    newLabel.innerHTML = 'FPETO';
    newBox.appendChild(newLabel);
    newP = document.createElement('p');

    let fpeto = eto;
    if (leg.fpeto != null)
        fpeto = leg.fpeto;
    while (fpeto >= 86400)
        fpeto -= 86400;
    newP.innerHTML = FormatLegTime(fpeto);
    newBox.appendChild(newP);
    newDiv.appendChild(newBox);

    newRow.appendChild(newDiv);

    list.appendChild(newRow);

    if (leg.ato != null || leg.afob != null)
        setTimeout(function () {
            newRow.scrollIntoView({
                behavior: "instant",
                block: "start",
            });
        }, 1);
}

const zeroPad = (num, places) => String(num).padStart(places, '0');
function UpdateLegTime(leg, time) {
    if (time == "") {
        delete leg.ato;
        delete leg.diff_time;
    } else {
        leg.ato = zeroPad(time, 4).toString();
    }

    localStorage.setItem('flight_data', JSON.stringify(flightData));
}

function UpdateLegFuel(leg, fuel) {
    if (fuel == "" || fuel == 0) {
        delete leg.afob;
        delete leg.diff_fuel;
    } else {
        leg.afob = fuel.toString();

        let diff = Number(leg.afob) - Number(leg.fuel_min_onboard);
        leg.diff_fuel = diff;
    }

    localStorage.setItem('flight_data', JSON.stringify(flightData));
}

function UpdateInputLabel(input, diff) {
    let elements = input.parentElement.getElementsByClassName('leg-row-inp-lbl');
    while (elements.length > 0) {
        elements[0].remove();
    }
    if (diff == null) return;

    const newLbl = document.createElement('label');
    newLbl.htmlFor = input.id;
    newLbl.className = 'leg-row-inp-lbl';
    newLbl.innerHTML = (diff <= 0 ? "" : "+") + diff;
    newLbl.style.color = 'red';
    if (diff >= 0)
        newLbl.style.color = 'green';
    input.parentElement.appendChild(newLbl)
}