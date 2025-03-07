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

    const dir = flightData.files.directory + flightData.files.pdf.link;
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

    if (flightData.params.units == "kgs")
        units = " kg";
    else
        units = " lb";

    document.getElementById('txtTaxiFuel').innerHTML = fuelData.taxi + units;
    document.getElementById('txtTripFuel').innerHTML = fuelData.enroute_burn + units;
    document.getElementById('txtAltnFuel').innerHTML = fuelData.alternate_burn + units;
    document.getElementById('txtContFuel').innerHTML = fuelData.contingency + units;
    document.getElementById('txtFinResFuel').innerHTML = fuelData.reserve + units;
    document.getElementById('txtPlnBlkFuel').innerHTML = fuelData.plan_ramp + units;

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

    // insert disc fuels

    // update final_ramp (includes tank+disc)



    localStorage.setItem('fuel_data', JSON.stringify(fuelData));
}