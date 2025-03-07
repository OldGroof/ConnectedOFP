const inputElement = document.getElementById('inpID');
if (inputElement != null) {
    inputElement.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            const inputValue = inputElement.value;
            SetSimbriefID(Number(inputValue));
            inputElement.blur();
        }
    });
}

var smbrfID = 0;
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
        setCookie("simbrief_id", smbrfID.toString(), 30);

        RefreshOFP();
    } else {
        smbrfID = 0;

        flightData = {};
        sessionStorage.removeItem('flight_data');
        localStorage.removeItem('flight_data');
        document.getElementById("inpID").value = "";
    }
}

function GetSimbriefOFP() {
    let id_cookie = getCookie("simbrief_id");
    if (id_cookie != "")
        smbrfID = parseInt(getCookie("simbrief_id"));
    else smbrfID = 0;

    if (smbrfID == 0) {
        console.error("There is no Simbrief ID.");

        flightData = {};
        sessionStorage.removeItem('flight_data');
        localStorage.removeItem('flight_data');
        document.getElementById("inpID").value = "";
        return;
    }
    document.getElementById("inpID").value = smbrfID.toString();

    flightData = JSON.parse(localStorage.getItem('flight_data'));

    if (flightData == null || isEmpty(flightData)) {
        console.log("Fetching flightData from Simbrief.");

        //https://www.simbrief.com/api/xml.fetcher.php?userid=xxxxxx&json=1
        let url = 'https://www.simbrief.com/api/xml.fetcher.php?userid=';
        url += smbrfID.toString() + "&json=1";

        fetch(url)
            .then(response => {
                // Check if the response is successful
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                // Parse the response as JSON
                return response.json();
            })
            .then(data => {
                localStorage.setItem('flight_data', JSON.stringify(data));
                sessionStorage.setItem('flight_data', JSON.stringify(data));
                flightData = data;
            })
            .catch(error => {
                // Handle any errors that occurred during the fetch
                console.error('There was a problem with the fetch operation:', error);
            });
    }
}

function RefreshOFP() {
    if (smbrfID == 0) {
        console.error("There is no Simbrief ID.");

        flightData = {};
        sessionStorage.removeItem('flight_data');
        localStorage.removeItem('flight_data');
        document.getElementById("inpID").value = "";
        return;
    }
    console.log("Fetching flightData from Simbrief.");

    //https://www.simbrief.com/api/xml.fetcher.php?userid=xxxxxx&json=1
    let url = 'https://www.simbrief.com/api/xml.fetcher.php?userid=';
    url += smbrfID.toString() + "&json=1";

    fetch(url)
        .then(response => {
            // Check if the response is successful
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // Parse the response as JSON
            return response.json();
        })
        .then(data => {
            localStorage.setItem('flight_data', JSON.stringify(data));
            sessionStorage.setItem('flight_data', JSON.stringify(data));
            flightData = data;
        })
        .catch(error => {
            // Handle any errors that occurred during the fetch
            console.error('There was a problem with the fetch operation:', error);
        });
}

function GetPDF() {
    const dir = flightData.files.directory + flightData.files.pdf.link;
    const pfdEmbed = document.getElementById('outPDF');
    pfdEmbed.src = dir;
}