const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

function App() {
   const API_KEY = `60836d7502891317b3d0942b4f1d416b`;
   const locationsAPI = `https://vapi.vnappmob.com/api/province/`;
   const BASE_API = `https://api.openweathermap.org`;
   const weatherWrapper = $(".weather-wrapper");
   const futureForecastEl = $(".future-forecast");

   const globalEvents = () => {
      window.addEventListener("dragover", (e) => {
         e.preventDefault();
      });

      window.addEventListener("drop", (e) => {
         e.preventDefault();
      });

      window.addEventListener("click", (e) => {
         const selects = $$(".select");

         selects.forEach((item) => {
            if (!item.contains(e.target)) {
               const activedOptionWrapper = item.querySelector(".select-option-wrapper.active");
               activedOptionWrapper?.classList.remove("active");
            }
         });
      });
   };

   const handleOverlay = (action) => {
      if (action === "show") {
         const overlay = document.createElement("div");
         overlay.className = "overlay";
         overlay.innerHTML = `
            <svg class="spinner" viewBox="0 0 50 50">
               <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
            </svg>
         `;
         document.body.appendChild(overlay);
      } else if (action === "hide") {
         const overlay = $(".overlay");
         overlay.remove();
      }
   };

   const handleSelectEls = () => {
      const selects = $$(".select");

      selects.forEach((item) => {
         item.onclick = (e) => {
            const optionWrapper = item.querySelector(".select-option-wrapper");
            const options = item.querySelectorAll(".select-option");
            const title = item.querySelector(".select-title span");

            options.forEach((selectItem) => {
               if (selectItem.contains(e.target)) {
                  title.dataset.value = e.target.dataset.value;
                  title.innerText = title.dataset.value;
               }
            });

            optionWrapper.classList.toggle("active");

            optionWrapper.ontransitionstart = (e) => {
               if (!e.currentTarget.classList.contains("active")) {
                  item.style.pointerEvents = "none";
               }
            };

            optionWrapper.ontransitionend = (e) => {
               if (!e.currentTarget.classList.contains("active")) {
                  item.style = "";
               }
            };
         };
      });
   };

   const selectLocation = async () => {
      const datas = await axios(locationsAPI);
      const select = $(".select.location");
      const optionList = select.querySelector(".select-option-list");

      // console.log(datas.data);

      const htmls = datas.data.results?.map(
         (item) => `
            <div data-value="${item.province_name}" class="select-option">${item.province_name}</div>
         `,
      );

      optionList.innerHTML = htmls.join("\n");

      const options = select.querySelectorAll(".select-option");

      options.forEach((item) => {
         item.onclick = async (e) => {
            handleOverlay("show");
            await handleGetWeather(e);
            handleOverlay("hide");
         };
      });
   };

   const handleGetWeather = async (e) => {
      const locationName = e.currentTarget.dataset.value;
      const formatName = locationName.includes("Thành phố")
         ? locationName.replace("Thành phố ", "")
         : locationName.includes("Tỉnh")
         ? locationName.replace("Tỉnh ", "")
         : locationName;
      const coordinatesAPI = `${BASE_API}/geo/1.0/direct?q="${formatName}"&limit=5&appid=${API_KEY}`;

      const { data } = await axios(coordinatesAPI);

      if (!data.length) {
         alert(`Hiện chưa có dữ liệu tại: ${locationName}!`);
         handleOverlay("hide");
         return;
      }

      const { lat, lon } = data[0];
      const weathersAPI = `${BASE_API}/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&lang=vi&appid=${API_KEY}`;
      const { data: weatherData } = await axios(weathersAPI);

      handleRenderWeather(weatherData, locationName);
   };

   const handleRenderWeather = (weatherData, locationName) => {
      const currWeather = weatherData.current;
      const {
         temp: currTemp,
         clouds: currClouds,
         feels_like: currfeelsLike,
         pressure: currPressure,
         wind_speed: currWindSpeed,
         humidity: currHumidity,
         weather: currWeatherdata,
         uvi: currUVI,
         visibility: currVisibility,
      } = currWeather;
      const daily = weatherData.daily;
      const currDateWeather = daily[0];
      const dailyCopied = [...daily];
      const remainingDailyCopied = dailyCopied.filter((item, index) => index > 0);
      const { temp: currDateTemp } = currDateWeather;

      weatherWrapper.innerHTML = `
         <div class="weather-header">
            <img src="./assets/icons/location-icon.svg" alt="" />
            <span class="weather-header__location-name">${locationName || "Vị trí của bạn"}</span>
         </div>
         <div class="weather-content">
            <div class="weather-content-header">
               <div class="weather-header__date-wrapper">
                  <span class="weather-header__date"></span>
                  <span class="weather-header__curr-time"></span>
               </div>
               <img
                  loading="true"
                  class="weather-content-header__weather-icon"
                  src="https://openweathermap.org/img/wn/${currWeatherdata[0].icon}@2x.png"
                  alt=""
               />
               <div class="weather-content-header__content">
                  <span class="weather-content-header__temp">${Math.round(currTemp)}&deg;C</span>
                  <span class="weather-content-header__title">${
                     currWeatherdata[0].description[0].toUpperCase() + currWeatherdata[0].description.slice(1)
                  }</span>
               </div>
            </div>
            <div class="weather-content-body">
               <div class="weather-content-body__content">
                  <span>
                     <lord-icon class="icon" stroke="bold" colors="primary:#fff,secondary:#fff" src="./assets/animate-icon/max-temp.json" trigger="loop-on-hover" target=".weather-content-body__content span" state="morph-hot" style="width: 30px; height: 30px"></lord-icon>
                     Cao nhất: ${Math.round(currDateTemp.max)} &deg;C.
                  </span>
                  <span>
                     <lord-icon class="icon" stroke="bold" colors="primary:#fff,secondary:#fff" src="./assets/animate-icon/min-temp.json" trigger="loop-on-hover" target=".weather-content-body__content span" state="morph-cold" style="width: 30px; height: 30px"></lord-icon> 
                     Thấp nhất: ${Math.round(currDateTemp.min)} &deg;C.
                  </span>
                  <span>
                  <lord-icon class="icon" stroke="bold" colors="primary:#fff,secondary:#fff" src="./assets/animate-icon/feeling-temp.json" trigger="loop-on-hover" target=".weather-content-body__content span" state="hover-pinch" style="width: 30px; height: 30px"></lord-icon>
                     Cảm giác: ${Math.round(currfeelsLike)} &deg;C.
                  </span>
                  <span>
                  <lord-icon class="icon" stroke="bold" colors="primary:#fff,secondary:#fff" src="./assets/animate-icon/cloud.json" trigger="loop-on-hover" target=".weather-content-body__content span" state="loop-cloud-2" style="width: 30px; height: 30px"></lord-icon> 
                     Mây: ${
                        currClouds <= 20
                           ? "Mây rải rác."
                           : currClouds > 20 && currClouds <= 50
                           ? "Mức độ mây trung bình."
                           : currClouds > 50 && currClouds <= 80
                           ? "Nhiều mây."
                           : "Mây che phủ bầu trời."
                     }
                  </span>
                  <span>
                     <lord-icon class="icon" stroke="bold" colors="primary:#fff,secondary:#fff" src="./assets/animate-icon/pressure.json" trigger="loop-on-hover" target=".weather-content-body__content span" state="loop-cycle" style="width: 30px; height: 30px"></lord-icon>
                     Áp suất: ${currPressure} hPa.
                  </span>
                  <span>
                     <lord-icon class="icon" stroke="bold" colors="primary:#fff,secondary:#fff" src="./assets/animate-icon/wind-speed.json" trigger="loop-on-hover" target=".weather-content-body__content span" state="hover-pinch" style="width: 30px; height: 30px"></lord-icon>
                     Tốc độ gió: ${currWindSpeed} m/s.   
                  </span>
                  <span>
                     <lord-icon class="icon" stroke="bold" colors="primary:#fff,secondary:#fff" src="./assets/animate-icon/humidity.json" trigger="loop-on-hover" target=".weather-content-body__content span" state="loop-cycle" style="width: 30px; height: 30px"></lord-icon>
                     Độ ẩm: ${currHumidity} %.   
                  </span>
                  <span>
                     <lord-icon class="icon" stroke="bold" colors="primary:#fff,secondary:#fff" src="./assets/animate-icon/sun.json" trigger="loop-on-hover" target=".weather-content-body__content span" state="hover-rays" style="width: 30px; height: 30px"></lord-icon>
                     Tia UV: ${
                        currUVI <= 2
                           ? "Thấp"
                           : currUVI > 2 && currUVI <= 5
                           ? "Trung bình"
                           : currUVI > 5 && currUVI <= 7
                           ? "Cao"
                           : currUVI > 7 && currUVI <= 11
                           ? "Rất cao"
                           : "Nguy hiểm"
                     }.   
                  </span>
                  <span>
                     <lord-icon class="icon" stroke="bold" colors="primary:#fff,secondary:#fff" src="./assets/animate-icon/telescope.json" trigger="loop-on-hover" target=".weather-content-body__content span" state="loop-cycle" style="width: 30px; height: 30px"></lord-icon>
                     Tầm nhìn: ${currVisibility}m.   
                  </span>                                   
               </div>
            </div>
         </div>
      `;

      renderCurrTime();
      setInterval(() => {
         renderCurrTime();
      }, 1000);

      const futureForecastHtmls = remainingDailyCopied.map((item) => {
         const { dt, weather, temp, wind_speed } = item;
         const date = new Date(dt * 1000);
         const formatDay = `${date.getDay() + 1 === 1 ? "Chủ nhật" : `Thứ ${date.getDay() + 1}`}`;
         const formatDate = `${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}/${
            date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
         }/${date.getFullYear()}`;

         return `
            <div class="future-forecast-item-wrapper">
               <div class="future-forecast-item">
                  <div class="future-forecast-item__header">
                     <div class="future-forecast-item__header-date">
                        <span class="future-forecast-item__header-date-top">${formatDay}</span>
                        <span>${formatDate}</span>
                     </div>
                     <img src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png" alt="" />
                  </div>
                  <div class="future-forecast-item__body">
                     <div class="future-forecast-item__body-left">
                        <span>Tốc độ gió: ${Math.round(wind_speed)}m/s</span>
                        <span>${weather[0].description[0].toUpperCase() + weather[0].description.slice(1)}</span>
                     </div>

                     <div class="future-forecast-item__body-right">
                        <lord-icon
                           class="icon"
                           stroke="bold"
                           colors="primary:#fff,secondary:#fff"
                           src="./assets/animate-icon/temperature.json"
                           trigger="loop-on-hover" target=".future-forecast-item-wrapper"
                           state="loop-cycle"
                           style="width: 40px; height: 40px"
                        ></lord-icon>
                        <div class="future-forecast-item__body-right-text">
                           <span> Min: ${Math.round(temp.min)}°C </span>
                           <span> Max: ${Math.round(temp.max)}°C </span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         `;
      });

      futureForecastEl.innerHTML = futureForecastHtmls.join("\n");

      // console.log(remainingDailyCopied);
   };

   const renderCurrTime = () => {
      const currDate = new Date();
      const formatTime = `${currDate.getHours()}:${currDate.getMinutes() < 10 ? `0${currDate.getMinutes()}` : currDate.getMinutes()}:${
         currDate.getSeconds() < 10 ? `0${currDate.getSeconds()}` : currDate.getSeconds()
      }`;
      const formatDate = `Thứ ${currDate.getDay() + 1}, ${currDate.getDate()}/${currDate.getMonth() + 1}/${currDate.getFullYear()}`;
      const currTimeEl = $(".weather-header__curr-time");
      const currDateEl = $(".weather-header__date");

      currTimeEl.innerText = formatTime;
      currDateEl.innerText = formatDate;
   };

   const defaulRender = () => {
      if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(showPosition);
      } else {
         console.log("Geolocation is not supported by this browser.");
      }

      async function showPosition(position) {
         try {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const weathersAPI = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude || 10.7763897}&lon=${
               longitude || 106.7011391
            }&units=metric&lang=vi&appid=${API_KEY}`;

            handleOverlay("show");
            const { data: weatherData } = await axios(weathersAPI);

            if (weatherData) {
               handleRenderWeather(weatherData);
               handleOverlay("hide");
            }
         } catch (error) {
            handleOverlay("hide");
         }
      }
   };

   function start() {
      globalEvents();
      handleSelectEls();
      selectLocation();
      defaulRender();
   }
   start();
}

window.document.addEventListener("DOMContentLoaded", App);
