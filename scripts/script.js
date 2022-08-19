var x2js = new X2JS();
let myLocation = [];
let map;
let list = [];

var lightMap = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }
);

var darkMap = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 20,
  }
);

const successCallback = (position) => {
  myLocation = [position.coords.latitude, position.coords.longitude];
  map.setView(myLocation, 16);
  const marker = L.marker(myLocation, { icon: redIcon }).addTo(map);
  marker.bindPopup("<b>Hier ben je!</b>").openPopup();
};

const GetCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successCallback);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
};

const addMarkersWithData = (companies) => {
  let companyList = document.querySelector(`.js-companylist-data`);
  let i = 1;
  for (const company of companies) {
    company.id = i;
    list.push(company);
    const marker = L.marker([company.geo_y, company.geo_x]).addTo(map);
    marker.bindPopup(
      `<b>${company.bedrijfsnaam}</b></br></br><address><a href="https://www.google.com/maps?q=${company.straat}+${company.huisnr},+${company.postcode}+${company.deelgemeente}" target="_blank">${company.straat} ${company.huisnr},</br>${company.postcode} ${company.deelgemeente}</a></address>`
    );
    const option = document.createElement("option");
    option.value = company.id + ". " + company.bedrijfsnaam;
    option.innerHTML = `<p>${company.bedrijfsnaam}</p><address class="c-companylist-data__address">${company.straat} ${company.huisnr}, ${company.postcode} ${company.deelgemeente}</address>`;
    companyList.innerHTML += option.outerHTML;
    i++;
  }
};

const getData = async (url) => {
  const response = await fetch(url);

  const data = await x2js.xml_str2json(await response.text());
  addMarkersWithData(data.companies.company);
};

const start = document.addEventListener(`DOMContentLoaded`, (e) => {
  map = L.map("map").setView([51.505, -0.09], 16);
  const input = document.querySelector(`.js-input`);
  const back = document.querySelector(`.js-return`);
  const darklight = document.querySelector(`.js-change-map`);

  lightMap.addTo(map);

  GetCurrentLocation();

  getData("https://data.kortrijk.be/middenstand/winkels_markten.xml");

  input.addEventListener(`change`, (e) => {
    const id = e.target.value.substring(0, e.target.value.indexOf("."));
    const winkel = list.find((x) => x.id == id);
    map.setView([winkel.geo_y, winkel.geo_x], 16);
  });

  back.addEventListener(`click`, (e) => {
    map.setView(myLocation, 16);
  });

  darklight.addEventListener(`click`, (e) => {
    if (e.target.textContent == "Dark mode") {
      //pauzeer 5 seconden
      map.removeLayer(lightMap);
      darkMap.addTo(map);
      e.target.textContent = "Light mode";
    } else {
      map.removeLayer(darkMap);
      lightMap.addTo(map);
      e.target.textContent = "Dark mode";
    }
  });
});
