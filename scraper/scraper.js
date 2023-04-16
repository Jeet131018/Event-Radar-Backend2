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
            venue:"",
            prizes: $('#challenge-information .info:nth-child(2) td strong span:eq(1)').text(),
            socials:[],
            register: $('#primary a').attr('href'),
        };
        console.log(data);
        datas = data;
    });
    return datas;
  }

  module.exports={devpost_scrape}