const axios = require("axios");
const cheerio = require("cheerio");

async function devpost_scrape(url) {
  let datas = {};
  await axios.get(url).then((res) => {
    const $ = cheerio.load(res.data);

    var dt = new Date(
      $("#challenge-information .info:nth-child(1) strong")
        .text()
        .replace(/Deadline:|@|pm|EDT/g, "")
    );
    const data = {
      name: $("#introduction h1").text(),
      description: $("#introduction h3").text(),
      fees: "",
      startDate: dt.getTime(),
      endDate: "",
      venue: $("#challenge-information .info:nth-child(2) td:eq(0) div .info")
        .text()
        .replace(/\n/g, "")
        .trim(),
      prizes: $(
        "#challenge-information .info:nth-child(2) td strong span:eq(1)"
      ).text(),
      socials: [],
      register: $("#primary a").attr("href"),
    };
    console.log(data);
    datas = data;
  });
  return datas;
}

async function eventbrite_scrape(url) {
  let response = {};
  await axios.get(url).then((res) => {
    const $ = cheerio.load(res.data);
    const eventData = JSON.parse(
      $('script[type="application/ld+json"]').html().trim()
    );
    const data = {
      name: eventData.name,
      description: $(".has-user-generated-content div").html(),
      fees: eventData.offers[0].lowPrice,
      eventPriceUpperBound: eventData.offers[0].highPrice,
      startDate: new Date(eventData.startDate).getTime(),
      endDate: new Date(eventData.endDate).getTime(),
      venue: eventData.location.address.streetAddress,
      registrationLink: eventData.url,
      socials: $("div.css-ojn45 a")
        .map((index, element) => $(element).attr("href"))
        .get(),
      prize: "",
      eventOrganizer: eventData.organizer.name,
    };
    response = data;
  });
  return response;
}


async function devfolio_scrape(url) {
  let response = {};
  await axios.get(url).then(res => {
    const $ = cheerio.load(res.data);
    const eventData = JSON.parse($('#').html().trim());
    const eventDetails = eventData.props.pageProps.hackathon;
    const data = {
      name: eventDetails.name,
      endDate: new Date(eventDetails.ends_at).getTime(),
      venue: eventData.location.address.streetAddress,
      startDate: new Date(eventDetails.starts_at).getTime(),
      registrationLink: eventData.query.slug[0],
      description: eventDetails.desc,
      fee: 0,
      prize: eventData.props.pageProps.aggregatePrizeValue,
      eventOrganizer: eventData.organizer.name,
      socials: {
        "linkedin": eventDetails.settings.linkedin,
        "twitter": eventDetails.settings.twitter,
        "facebook": eventDetails.settings.facebook,
        "instagram": eventDetails.settings.instagram,
        "medium": eventDetails.settings.medium,
        "telegram": eventDetails.settings.telegram,
        "slack": eventDetails.settings.slack,
        "discord": eventDetails.settings.discord,
        "site": eventDetails.settings.site,
      },
      fees:0,
    };
    response = data;
  });
  return response;
}

module.exports = {
  devpost_scrape,
  eventbrite_scrape,
  devfolio_scrape,
};
