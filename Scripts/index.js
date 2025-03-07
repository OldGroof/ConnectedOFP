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
var flightData = JSON.parse(sessionStorage.getItem('flight_data'));

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

    flightData = JSON.parse(localStorage.getItem('flight_data'));

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
    if (isNaN(smbrfID))
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
    sessionStorage.removeItem('flight_data');
    localStorage.removeItem('flight_data');
    document.getElementById("inpID").value = "";
    document.getElementById("txtFltID").innerHTML = "Flight";
    document.cookie = "simbrief_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function GetPDF() {
    if (flightData == null || isEmpty(flightData)) {
        flightData = JSON.parse(localStorage.getItem('flight_data'));
        sessionStorage.setItem('flight_data', JSON.stringify(flightData));
    }

    const dir = flightData.files.directory + flightData.files.pdf.link;
    const pfdEmbed = document.getElementById('outPDF');
    pfdEmbed.src = dir;
}

function GetFuelPlan() {
    if (flightData == null || isEmpty(flightData)) {
        flightData = JSON.parse(localStorage.getItem('flight_data'));
        sessionStorage.setItem('flight_data', JSON.stringify(flightData));
    }

    // populate fuel stuff here
    // taxi
    // trip
    // cont
    // alternate
    // finres
    // plog
    // tankering
    // disc
    // final blk
}