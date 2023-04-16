const axios = require('axios');
const cheerio = require('cheerio');

async function devpost_scrape(url){
    let datas = {};
    await axios.get(url).then(res => {
        const $ = cheerio.load(res.data);

        var dt = new Date($('#challenge-information .info:nth-child(1) strong').text().replace(/Deadline:|@|pm|EDT/g, ''));
        const data = {
            name: $("#introduction h1").text(),
            description: $("#introduction h3").text(),
            fees:"",
            startDate: dt.getTime(),
            endDate:"",
            venue:$('#challenge-information .info:nth-child(2) td:eq(0) div .info').text().replace(/\n/g, "").trim(),
            prizes: $('#challenge-information .info:nth-child(2) td strong span:eq(1)').text(),
            socials:[],
            register: $('#primary a').attr('href'),
        };
        console.log(data);
        datas = data;
    });
    return datas;
  }

async function eventbrite_scrape(url) {
    let response = {};
    await axios.get(url).then(res => {
        const $ = cheerio.load(res.data);
        const eventData = JSON.parse($('script[type="application/ld+json"]').html().trim());
        const data = {
            eventName: eventData.name,
            eventEndDate: new Date(eventData.endDate).getTime(),
            eventAddress: eventData.location.address.streetAddress,
            eventStartDate: new Date(eventData.startDate).getTime(),
            eventRegistrationLink: eventData.url,
            eventDescription: $('.has-user-generated-content div').html(),
            eventOrganizer: eventData.organizer.name,
            eventOrganizerSocials: $('div.css-ojn45 a').map((index, element) => $(element).attr('href')).get(),
            eventPriceLowerBound: eventData.offers[0].lowPrice,
            eventPriceUpperBound: eventData.offers[0].highPrice
        };
        response = data;
    });
    return response;
} 


  




module.exports = {
    devpost_scrape, 
    eventbrite_scrape,
};