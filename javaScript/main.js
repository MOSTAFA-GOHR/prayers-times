//selecte language

let dateHijri = document.querySelector(".time-date .hijri");
let dateAD = document.querySelector(".time-date .ad");


window.onload = function(){
    let locationName= document.querySelector(".location h2");
    let selectedCity= document.getElementById("city");

    applyLanguage()

    let languageSelected = document.getElementById("lang");
    let saveLanguage=localStorage.getItem("language");

    if(localStorage.getItem("language")){
        languageSelected.value=saveLanguage;
    }
    languageSelected.addEventListener("change",(e)=>{
    const language = e.target.value;

    localStorage.setItem("language",language);
    applyLanguage()
    window.location.reload();
    })

    //Selecte the city

    selectedCity.addEventListener("change",(e)=>{
    let city = e.target.value;
    localStorage.setItem("selectedCity",city);
    if(city === "cairo"){
        getDataOfTiming("https://api.aladhan.com/v1/calendarByCity/2025/11?city=Cairo&country=EG&state=Cairo&method=3&shafaq=general&tune=5%2C3%2C5%2C7%2C9%2C-1%2C0%2C8%2C-6&school=0&midnightMode=0&timezonestring=Africa%2FCairo&latitudeAdjustmentMethod=1&calendarMethod=HJCoSA");

        locationName.textContent= (localStorage.getItem("language") === "english")?`Cairo, Egypt`:`القاهرة- مصر`;
    }else{
        getDataOfTiming("https://api.aladhan.com/v1/calendarByCity/2025/11?city=Makkah&country=SA&state=Makkah&method=5&shafaq=general&tune=5%2C3%2C5%2C7%2C9%2C-1%2C0%2C8%2C-6&school=0&midnightMode=0&timezonestring=Asia%2FRiyadh&calendarMethod=HJCoSA")
        
        locationName.textContent = (localStorage.getItem("language")=== "english")?'Makkah, Saudi Arabia':'مكة- المملكة العربية السعودية';
    }
    })

    const currentCity = localStorage.getItem("selectedCity") || "cairo";   // 
        if (currentCity === "cairo") {
            getDataOfTiming("https://api.aladhan.com/v1/calendarByCity/2025/11?city=Cairo&country=EG&state=Cairo&method=3&shafaq=general&tune=5%2C3%2C5%2C7%2C9%2C-1%2C0%2C8%2C-6&school=0&midnightMode=0&timezonestring=Africa%2FCairo&latitudeAdjustmentMethod=1&calendarMethod=HJCoSA");
            locationName.textContent = (saveLanguage || "english") === "english" ? "Cairo, Egypt" : "القاهرة - مصر";
        } else {
            getDataOfTiming("https://api.aladhan.com/v1/calendarByCity/2025/11?city=Makkah&country=SA&state=Makkah&method=5&shafaq=general&tune=5%2C3%2C5%2C7%2C9%2C-1%2C0%2C8%2C-6&school=0&midnightMode=0&timezonestring=Asia%2FRiyadh&calendarMethod=HJCoSA")
            locationName.textContent = (saveLanguage || "english") === "english" ? "Makkah, Saudi Arabia" : "مكة - المملكة العربية السعودية";
        }

}





//get data form api 
function getDataOfTiming(url){
    const date = new Date();
    const todayDate = date.getDate()

    fetch(url)
    .then(response=>{
        if(!response.ok)throw new Error(`HTTP ${response.status}`);
        return response.json();
    })
    .then(response=>{
        let todayIndex = todayDate -1 
        getDate(response.data[todayIndex]);
        prayersTimingArrange(response.data[todayIndex]);
        remainingTime(response.data[todayIndex]);
        applyLanguage(localStorage.getItem("language") || "english");
    })
    .catch(error => console.error("API Error:", error))
}


function applyLanguage(){
    const language=localStorage.getItem("language") ||"english"
    const times = ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];
    const timesArabic = ['الفجر','الشروق','الظهر','العصر','المغرب','العشاء'];

    if(language === "english" ){
        document.querySelectorAll(".cards .card h3").forEach((h3,i)=>{
            h3.innerHTML = times[i];
        })
    }else{
        document.querySelectorAll(".cards .card h3").forEach((h3,i)=>{
            h3.innerHTML = timesArabic[i];
        })
    }
    const lang= (localStorage.getItem("language") || "english");

    if(lang === "arabic"){
        document.documentElement.dir="rtl";
        document.documentElement.lang = "ar";
        document.body.classList.add("rtl");
    }else{
        document.documentElement.dir="ltr";
        document.documentElement.lang = "en";
        document.body.classList.remove("rtl");
    }
}




// show the date hijri and gregorian
function getDate(response){
    if(localStorage.getItem("language") === "english"){
        dateHijri.innerHTML=response.date.hijri.date +"  Hijri";
        dateAD.innerHTML=response.date.gregorian.date + "  Ad";
    }else{
        dateAD.innerHTML=response.date.gregorian.date + " م";
        dateHijri.innerHTML = response.date.hijri.weekday.ar+" " + response.date.hijri.day +" " + response.date.hijri.month.ar +" " + response.date.hijri.year;
    }
    
}


// fill of the cards of prayers times
function prayersTimingArrange(response){
    const {Fajr,Sunrise,Dhuhr,Asr,Maghrib,Isha} = response.timings;
    const timings = [Fajr,Sunrise,Dhuhr,Asr,Maghrib,Isha];
    Array.from(document.querySelectorAll('.prayers-time .cards p')).forEach((p,i)=>{
        p.textContent=timings[i].split(" ")[0];
    })
}



// remaining time for the next prayer time

function remainingTime(response){
    const now = new Date();
    const nextPrayers = convertDate(response);
    const gregDate = response.date.gregorian.date; 
    const [dd, mm, yyyy] = gregDate.split('-');

    const TimeOfPrayers = nextPrayers.map(time =>`${yyyy}-${mm}-${dd}T${time}:00`);
    
    const changeToMillSec = TimeOfPrayers.map(time=> new Date(time).getTime());

    const upcoming = changeToMillSec.find(dt => dt > now.getTime());



    let index = changeToMillSec.findIndex(dt => dt > now.getTime());
    if (index === -1) index = 0;




    let nextTime;
    if(!upcoming){
        const tomorrow =  new Date(now);
        tomorrow.setDate(tomorrow.getDate() +1);
        const tISO = tomorrow.toISOString().split("T")[0];

        nextTime = new Date(`${tISO}T${nextPrayers[0]}:00`);
    } else {
        nextTime = new Date(upcoming);
    }

    
    const diffMs = nextTime - now;
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    const diffM = Math.floor((diffMs / (1000 * 60)) % 60);
    const diffS = Math.floor((diffMs / 1000) % 60);


    const times = ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];
    const timesArabic = ['الفجر','الشروق','الظهر','العصر','المغرب','العشاء'];
    
    if(localStorage.getItem("language") === "english"){
        document.querySelector(".prayers-time .now-prayers div h3").textContent=times[index];
    }else{
        document.querySelector(".prayers-time .now-prayers div h3").textContent=timesArabic[index];
    }

    document.querySelector(".prayers-time .now-prayers div p ").textContent =`${diffH}:${diffM}:${diffS}`;
    
    timeAnimation(diffMs,nextTime,changeToMillSec[index - 1 ]??changeToMillSec[0])
    setTimeout(() => remainingTime(response), 1000);
}



function convertDate(response){
    const {Fajr,Sunrise,Dhuhr,Asr,Maghrib,Isha} = response.timings;
    const times = [Fajr,Sunrise,Dhuhr,Asr,Maghrib,Isha];
    const prayers = times.map(time => time.split(" ")[0]);
    return prayers
}



// the animation of drop Up water 
let px=520;

function timeAnimation(diffMs,nextTime,current) {
    const total=nextTime-current;

    const endTime =  total - diffMs;
    
    const minPx =520;
    const maxPX = 800;

    let progress = 1 - Number(endTime)/Number(total);

    px=minPx + (maxPX - minPx) * progress;

    const circle = document.querySelector('.now-prayers div .circle');
    circle.style.bottom = `-${px}px`;
    

}

