const inputElement = document.getElementById('inpID');
if (inputElement != null) {
    inputElement.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            const inputValue = inputElement.value;
            SetSimbriefID(inputValue);
            inputElement.blur();
        }
    });
}

var smbrfID = "";
var units = " kg"
var flightData = JSON.parse(sessionStorage.getItem('flight_data'));
var fuelData = JSON.parse(localStorage.getItem('fuel_data'));

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
    GetPDF();
}

function GoPlnFuel() {
    document.getElementById('divHome').style = "display: none;";
    document.getElementById('divOFP').style = "display: none;";
    document.getElementById('divActFuel').style = "display: none;";
    document.getElementById('divNavLog').style = "display: none;";


    document.getElementById('divPlnFuel').style = "display: block;";
    GetFuelPlan();
}

function GoActFuel() {
    document.getElementById('divHome').style = "display: none;";
    document.getElementById('divOFP').style = "display: none;";
    document.getElementById('divPlnFuel').style = "display: none;";
    document.getElementById('divNavLog').style = "display: none;";


    document.getElementById('divActFuel').style = "display: block;";
    GetLiveData();
}

function GoNavLog() {
    document.getElementById('divHome').style = "display: none;";
    document.getElementById('divOFP').style = "display: none;";
    document.getElementById('divPlnFuel').style = "display: none;";
    document.getElementById('divActFuel').style = "display: none;";


    document.getElementById('divNavLog').style = "display: block;";
    GetNavLog();
}

function SetSimbriefID(id) {
    if (id != null && id != 0) {
        smbrfID = id;
        setCookie("simbrief_id", smbrfID, 30);

        RefreshOFP();
    } else {
        smbrfID = "";
        ResetData();
    }
}

function GetSimbriefOFP() {
    let id_cookie = getCookie("simbrief_id");
    if (id_cookie != "")
        smbrfID = id_cookie;
    else smbrfID = "";

    if (smbrfID == "") {
        console.error("There is no Simbrief ID.");
        ResetData();
        return;
    }
    document.getElementById("inpID").value = smbrfID;

    GetFlightDataLocal();

    if (flightData == null || isEmpty(flightData)) {
        FetchSimbriefAPI();
    } else {
        let date = FormatDate(flightData.api_params.date);
        let fltID = "Flight - ";
        if (!isEmpty(flightData.general.icao_airline))
            fltID = "Flight - #" + flightData.general.icao_airline + flightData.general.flight_number + "/" + date + "(" + flightData.general.release + ")";
        else
            fltID = "Flight - " + flightData.general.flight_number + "/" + date + "(" + flightData.general.release + ")";

        fltID += ": " + flightData.origin.iata_code + "-" + flightData.destination.iata_code;
        console.log(fltID);
        document.getElementById("txtFltID").innerHTML = fltID;

        sessionStorage.setItem('flight_data', JSON.stringify(flightData));
    }
}

function RefreshOFP() {
    if (smbrfID == "") {
        console.error("There is no Simbrief ID.");
        ResetData();
        return;
    }
    FetchSimbriefAPI();
}

function FormatDate(seconds) {
    const date = new Date(seconds * 1000);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    return `${day}${month}`;
}

function SetFlightData(data) {
    localStorage.setItem('flight_data', JSON.stringify(data));
    sessionStorage.setItem('flight_data', JSON.stringify(data));
    flightData = data;

    localStorage.removeItem('fuel_data');
    fuelData = flightData.fuel;
    localStorage.setItem('fuel_data', JSON.stringify(fuelData));

    localStorage.removeItem('live_data');
    liveData = null;

    let date = FormatDate(flightData.api_params.date);
    let fltID = "Flight - ";
    if (!isEmpty(flightData.general.icao_airline))
        fltID = "Flight - #" + flightData.general.icao_airline + flightData.general.flight_number + "/" + date + "(" + flightData.general.release + ")";
    else
        fltID = "Flight - " + flightData.general.flight_number + "/" + date + "(" + flightData.general.release + ")";

    fltID += ": " + flightData.origin.iata_code + "-" + flightData.destination.iata_code;
    console.log(fltID);
    document.getElementById("txtFltID").innerHTML = fltID;
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

function ResetData() {
    flightData = {};
    fuelData = {};
    liveData = {};
    units = " kg";
    sessionStorage.removeItem('flight_data');
    localStorage.removeItem('flight_data');
    localStorage.removeItem('fuel_data');
    localStorage.removeItem('live_data');
    document.getElementById("inpID").value = "";
    document.getElementById("txtFltID").innerHTML = "Flight";
    document.cookie = "simbrief_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function GetFlightDataLocal() {
    flightData = JSON.parse(localStorage.getItem('flight_data'));
    sessionStorage.setItem('flight_data', JSON.stringify(flightData));
}

function GetPDF() {
    if (flightData == null || isEmpty(flightData))
        GetFlightDataLocal();

    const pfdEmbed = document.getElementById('outPDF');
    if (flightData == null) {
        pfdEmbed.src = "";
        return;
    }

    const dir = "https://docs.google.com/gview?url=" + flightData.files.directory + flightData.files.pdf.link + "&embedded=true";
    pfdEmbed.src = dir;
}

function GetFuelPlan() {
    if (flightData == null || isEmpty(flightData))
        GetFlightDataLocal();
    if (fuelData == null || isEmpty(fuelData))
        fuelData = JSON.parse(localStorage.getItem('fuel_data'));

    const lblCont = document.getElementById('lblCont');
    lblCont.innerHTML = "Contingency:";

    const txtTaxiFuel = document.getElementById('txtTaxiFuel');
    txtTaxiFuel.innerHTML = "- kg";
    const txtTripFuel = document.getElementById('txtTripFuel');
    txtTripFuel.innerHTML = "- kg";
    const txtContFuel = document.getElementById('txtContFuel');
    txtContFuel.innerHTML = "- kg";
    const txtAltnFuel = document.getElementById('txtAltnFuel');
    txtAltnFuel.innerHTML = "- kg";
    const txtFinResFuel = document.getElementById('txtFinResFuel');
    txtFinResFuel.innerHTML = "- kg";
    const txtPlnBlkFuel = document.getElementById('txtPlnBlkFuel');
    txtPlnBlkFuel.innerHTML = "- kg";
    const txtFnlBlkFuel = document.getElementById('txtFnlBlkFuel');
    txtFnlBlkFuel.innerHTML = "- kg";

    const inpAltns = document.getElementById('inpAltns');
    inpAltns.disabled = false;
    inpAltns.value = "";
    const inpTankFuel = document.getElementById('inpTankFuel');
    inpTankFuel.disabled = false;
    inpTankFuel.value = "";
    const butDiscAdd = document.getElementById('butDiscAdd');
    butDiscAdd.disabled = false;

    const discList = document.getElementById('disc_list');
    while (discList.firstChild)
        discList.removeChild(discList.firstChild);

    UpdateZFWGauge(0, 1);
    UpdateTOWGauge(0, 1);
    UpdateLWGauge(0, 1);

    if (fuelData == null && flightData == null) {
        inpAltns.disabled = true;
        inpTankFuel.disabled = true;
        butDiscAdd.disabled = true;
        return;
    }

    if (fuelData.tank == null)
        fuelData.tank = 0;
    if (fuelData.final_ramp == null)
        fuelData.final_ramp = Number(fuelData.plan_ramp);

    if (flightData.params.units == "kgs")
        units = " kg";
    else
        units = " lb";

    if (units == " lb")
        document.getElementById('spnTankFuel').innerHTML = "lb";

    lblCont.innerHTML = "Contingency: " + flightData.general.cont_rule;
    txtTaxiFuel.innerHTML = fuelData.taxi + units;
    txtTripFuel.innerHTML = fuelData.enroute_burn + units;
    txtAltnFuel.innerHTML = fuelData.alternate_burn + units;
    txtContFuel.innerHTML = fuelData.contingency + units;
    txtFinResFuel.innerHTML = fuelData.reserve + units;
    txtPlnBlkFuel.innerHTML = fuelData.plan_ramp + units;
    txtFnlBlkFuel.innerHTML = fuelData.final_ramp + units;

    if (fuelData.tank != null && fuelData.tank != "0")
        inpTankFuel.value = fuelData.tank;

    while (inpAltns.firstChild)
        inpAltns.removeChild(inpAltns.firstChild);

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
            if (flightData.select_alternate == i)
                inpAltns.value = i;
        }
    }
    if (inpAltns.options.length == 0)
        inpAltns.disabled = true;

    inpTankFuel.addEventListener("keyup", UpdateFuelPlan);

    

    if (fuelData.discretionary != null) {
        for (var i = 0; i < fuelData.discretionary.length; i++) {
            let disc = fuelData.discretionary[i];

            AddDiscRow(i);
            document.getElementById('inpDiscRes' + i.toString()).value = disc.reason;
            inp = document.getElementById('inpDiscFuel' + i.toString());
            if (disc.amount != "0")
                inp.value = disc.amount;
        }
    }

    let zfw = Number(flightData.weights.est_zfw);
    flightData.weights.est_tow = zfw + (Number(fuelData.final_ramp) - Number(fuelData.taxi));
    flightData.weights.est_ldw = Number(flightData.weights.est_tow) - Number(fuelData.enroute_burn);

    UpdateZFWGauge(flightData.weights.est_zfw, flightData.weights.max_zfw);
    UpdateTOWGauge(flightData.weights.est_tow, flightData.weights.max_tow);
    UpdateLWGauge(flightData.weights.est_ldw, flightData.weights.max_ldw);

    localStorage.setItem('flight_data', JSON.stringify(flightData));
    sessionStorage.setItem('flight_data', JSON.stringify(flightData));
}

function UpdateFuelPlan() {
    // update alternate fuel
    if (flightData.alternate.length == null) {
        fuelData.alternate_burn = flightData.alternate.burn;
    } else {
        const select = document.getElementById('inpAltns');
        fuelData.alternate_burn = flightData.alternate[select.value].burn;
        flightData.select_alternate = select.value.toString();

        localStorage.setItem('flight_data', JSON.stringify(flightData));
        sessionStorage.setItem('flight_data', JSON.stringify(flightData));
    }
    document.getElementById('txtAltnFuel').innerHTML = fuelData.alternate_burn + units;

    // update min_takeoff
    fuelData.min_takeoff = Number(fuelData.enroute_burn) + Number(fuelData.contingency)
        + Number(fuelData.alternate_burn) + Number(fuelData.reserve)
        + Number(fuelData.etops) + Number(fuelData.extra)
        + Number(fuelData.extra_required) + Number(fuelData.extra_optional);

    // update plan_takeoff
    fuelData.plan_takeoff = fuelData.min_takeoff;
    // update plan_ramp
    fuelData.plan_ramp = Number(fuelData.plan_takeoff) + Number(fuelData.taxi);
    // update plan_landing
    fuelData.plan_landing = Number(fuelData.plan_takeoff) - Number(fuelData.enroute_burn);

    document.getElementById('txtPlnBlkFuel').innerHTML = fuelData.plan_ramp + units;

    // update tankering value
    const inp = document.getElementById("inpTankFuel");
    if (inp.value != "") {
        fuelData.tank = inp.value.toString();
    } else {
        fuelData.tank = "0";
    }

    // update disc fuels
    if (fuelData.discretionary != null) {
        for (var i = 0; i < fuelData.discretionary.length; i++) {
            let discSel = document.getElementById("inpDiscRes" + i.toString());
            let discInp = document.getElementById("inpDiscFuel" + i.toString());

            discSel.reason = fuelData.discretionary[i].reason;
            if (discInp.value != "") {
                fuelData.discretionary[i].amount = discInp.value;
            } else {
                fuelData.discretionary[i].amount = "0";
            }
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

    document.getElementById('txtFnlBlkFuel').innerHTML = fuelData.final_ramp + units;

    let zfw = Number(flightData.weights.est_zfw);
    flightData.weights.est_tow = zfw + (Number(fuelData.final_ramp) - Number(fuelData.taxi));
    flightData.weights.est_ldw = Number(flightData.weights.est_tow) - Number(fuelData.enroute_burn);

    UpdateZFWGauge(flightData.weights.est_zfw, flightData.weights.max_zfw);
    UpdateTOWGauge(flightData.weights.est_tow, flightData.weights.max_tow);
    UpdateLWGauge(flightData.weights.est_ldw, flightData.weights.max_ldw);

    localStorage.setItem('flight_data', JSON.stringify(flightData));
    sessionStorage.setItem('flight_data', JSON.stringify(flightData));
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

    const div = document.getElementById('divFuel');
    div.scrollTop = div.scrollHeight;

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

function GetLiveData() {
    if (flightData == null || isEmpty(flightData))
        GetFlightDataLocal();
    if (fuelData == null || isEmpty(fuelData))
        fuelData = JSON.parse(localStorage.getItem('fuel_data'));

    liveData = JSON.parse(localStorage.getItem('live_data'));
    if (liveData == null || isEmpty(liveData))
        liveData = {};

    const inpActFuel = document.getElementById('inpActFuel');
    inpActFuel.disabled = false;
    inpActFuel.placeholder = "Actual Fuel";
    inpActFuel.value = "";
    const inpOutTime = document.getElementById('inpOut');
    inpOutTime.disabled = false;
    inpOutTime.value = "";
    const inpOffTime = document.getElementById('inpOff');
    inpOffTime.disabled = false;
    inpOffTime.value = "";
    const inpOnTime = document.getElementById('inpOn');
    inpOnTime.disabled = false;
    inpOnTime.value = "";
    const inpInTime = document.getElementById('inpIn');
    inpInTime.disabled = false;
    inpInTime.value = "";
    if (flightData == null || fuelData == null) {
        inpActFuel.disabled = true;
        inpOutTime.disabled = true;
        inpOffTime.disabled = true;
        inpOnTime.disabled = true;
        inpInTime.disabled = true;
        return;
    }

    if (fuelData.tank == null)
        fuelData.tank = 0;
    if (fuelData.final_ramp == null)
        fuelData.final_ramp = Number(fuelData.plan_ramp);

    if (liveData.dep_fuel == null)
        liveData.dep_fuel = "";
    if (liveData.out_time == null)
        liveData.out_time = "";
    if (liveData.off_time == null)
        liveData.off_time = "";
    if (liveData.on_time == null)
        liveData.on_time = "";
    if (liveData.in_time == null)
        liveData.in_time = "";

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
    sessionStorage.setItem('flight_data', JSON.stringify(flightData));
    localStorage.setItem('live_data', JSON.stringify(liveData));
}

function GetNavLog() {
    if (flightData == null || isEmpty(flightData))
        GetFlightDataLocal();
    if (fuelData == null || isEmpty(fuelData))
        fuelData = JSON.parse(localStorage.getItem('fuel_data'));
    liveData = JSON.parse(localStorage.getItem('live_data'));

    const legList = document.getElementById('legList');
    while (legList.firstChild)
        legList.removeChild(legList.firstChild);

    if (flightData == null || fuelData == null) return;

    if (fuelData.tank == null)
        fuelData.tank = 0;
    if (fuelData.final_ramp == null)
        fuelData.final_ramp = Number(fuelData.plan_ramp);

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
    sessionStorage.setItem('flight_data', JSON.stringify(flightData));
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
    sessionStorage.setItem('flight_data', JSON.stringify(flightData));
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