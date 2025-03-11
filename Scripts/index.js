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
        let fltID = "Flight - #" + flightData.general.icao_airline + flightData.general.flight_number + "/" + date + "(" + flightData.general.release + ")";
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

    let date = FormatDate(flightData.api_params.date);
    let fltID = "Flight - #" + flightData.general.icao_airline + flightData.general.flight_number + "/" + date + "(" + flightData.general.release + ")";
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
    units = " kg";
    sessionStorage.removeItem('flight_data');
    localStorage.removeItem('flight_data');
    localStorage.removeItem('fuel_data');
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

    const dir = "https://docs.google.com/gview?url=" + flightData.files.directory + flightData.files.pdf.link + "&embedded=true";
    const pfdEmbed = document.getElementById('outPDF');
    pfdEmbed.src = dir;
}

var select = document.getElementById("inpAltns")
if (select != null)
    select.addEventListener("change", UpdateFuelPlan);
var inp = document.getElementById("inpTankFuel")
if (inp != null) {
    inp.addEventListener("keyup", UpdateFuelPlan);
}

function GetFuelPlan() {
    if (flightData == null || isEmpty(flightData))
        GetFlightDataLocal();
    if (fuelData == null || isEmpty(fuelData))
        fuelData = localStorage.getItem('fuel_data');

    if (fuelData == null && flightData == null) {
        document.getElementById('inpAltns').disabled = true;
        document.getElementById('inpTankFuel').disabled = true;
        document.getElementById('butDiscAdd').disabled = true;
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

    document.getElementById('lblCont').innerHTML = "Contingency: " + flightData.general.cont_rule;
    document.getElementById('txtTaxiFuel').innerHTML = fuelData.taxi + units;
    document.getElementById('txtTripFuel').innerHTML = fuelData.enroute_burn + units;
    document.getElementById('txtAltnFuel').innerHTML = fuelData.alternate_burn + units;
    document.getElementById('txtContFuel').innerHTML = fuelData.contingency + units;
    document.getElementById('txtFinResFuel').innerHTML = fuelData.reserve + units;
    document.getElementById('txtPlnBlkFuel').innerHTML = fuelData.plan_ramp + units;
    document.getElementById('txtFnlBlkFuel').innerHTML = fuelData.final_ramp + units;

    if (fuelData.tank != null && fuelData.tank != "0")
        document.getElementById('inpTankFuel').value = fuelData.tank;

    select = document.getElementById('inpAltns');
    if (flightData.alternate.length == null) {
        let obj = flightData.alternate;

        var opt = document.createElement('option');
        opt.value = 0;
        opt.innerHTML = obj.icao_code;
        select.appendChild(opt);
    } else {
        for (let i = 0; i < flightData.alternate.length; i++) {
            let obj = flightData.alternate[i];

            var opt = document.createElement('option');
            opt.value = i;
            opt.innerHTML = obj.icao_code;
            select.appendChild(opt);
            if (flightData.select_alternate == i)
                select.value = i;
        }
    }
    if (select.options.length == 0)
        select.disabled = true;

    if (fuelData.discretionary != null) {
        for (var i = 0; i < fuelData.discretionary.length; i++) {
            let disc = fuelData.discretionary[i];

            AddDiscRow(i);
            document.getElementById('inpDiscRes' + i.toString()).value = disc.reason;
            let inp = document.getElementById('inpDiscFuel' + i.toString());
            if (disc.amount != "0")
                inp.value = disc.amount;
        }
    }
}

function UpdateFuelPlan() {
    // update alternate fuel
    if (flightData.alternate.length == null) {
        fuelData.alternate_burn = flightData.alternate.burn;
    } else {
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
    inp = document.getElementById('inpTankFuel');
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

    localStorage.setItem('fuel_data', JSON.stringify(fuelData));
}

function AddDiscRow(idx) {
    var list = document.getElementById('disc_list');

    var newRow = document.createElement('div');
    newRow.className = 'table-row';
    newRow.id = "divDisc" + idx.toString();

    var newHeader = document.createElement('h3');
    newHeader.innerHTML = "Discretionary";
    newRow.append(newHeader);

    var newSel = document.createElement('select');
    newSel.id = "inpDiscRes" + idx.toString();
    newSel.style = "margin-top: auto; margin-bottom: auto;";

    var optDis = document.createElement('option');
    optDis.disabled = true;
    optDis.value = "";
    optDis.innerHTML = "None";
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

function UpdateDiscReason(idx, value) {
    if (value == "") return;

    fuelData.discretionary[idx].reason = value.toString();
    localStorage.setItem('fuel_data', JSON.stringify(fuelData));
}