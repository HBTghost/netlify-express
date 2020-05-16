const express = require("express");
const router = express.Router();


function getUrl(place, date) {
  // const placeCodes = require("../data/placeCodes.json");
  const placeCodes = {
    "south": "mn",
    "middle": "mt",
    "north": "mb"
  }
  const placeCode = placeCodes[place];
  const baseUrl = process.env.HISTORY_RES_URL;
  return baseUrl.replace(/#place/g, placeCode).replace(/#date/g, date);
}
function getDateFromString(dateString) {
  var arr = dateString.split("-");
  const iso = arr.reverse().join("-");
  return new Date(iso);
}

function getChannels(place, dateString) {
  const date = getDateFromString(dateString);
  const regionChannels = {
    "south": {
      "0": ["Tiền Giang", "Kiên Giang", "Đà Lạt"],
      "1": ["TP HCM", "Đồng Tháp", "Cà Mau"],
      "2": ["Bến Tre", "Vũng Tàu", "Bạc Liêu"],
      "3": ["Đồng Nai", "Cần Thơ", "Sóc Trăng"],
      "4": ["Tây Ninh", "An Giang", "Bình Thuận"],
      "5": ["Vĩnh Long", "Bình Dương", "Trà Vinh"],
      "6": ["TP HCM", "Long An", "Bình Phước", "Hậu Giang"]
    },
    "middle": {
      "0": ["Khánh Hòa", "Kon Tum"],
      "1": ["Phú Yên", "Thừa Thiên Huế"],
      "2": ["Đắk Lắk", "Quảng Nam"],
      "3": ["Đà Nẵng", "Khánh Hòa"],
      "4": ["Quảng Bình", "Bình Định", "Quảng Trị"],
      "5": ["Gia Lai", "Ninh Thuận"],
      "6": ["Đà Nẵng", "Quảng Ngãi", "Đắk Nông"]
    },
    "north": {
      "0": "XSKT Thái Bình",
      "1": "XSKT Hà Nội",
      "2": "XSKT Quảng Ninh",
      "3": "XSKT Bắc Ninh",
      "4": "XSKT Hà Nội",
      "5": "XSKT Hải Phòng",
      "6": "XSKT Nam Định"
    }
  }
  return regionChannels[place][date.getDay()];
}

async function getResult(place, date) {
  const axios = require("axios");
  // const handleDate = require("../tools/handleDate.js");
  const channels = getChannels(place, date);

  var data = [];
  for (var i = 0; i < channels.length; ++i) {
    var tmp = [[], [], [], [], [], [], [], [], []];
    data.push(tmp.concat());
  }

  const url = getUrl(place, date);
  await axios(url)
    .then(response => {
      const cheerio = require("cheerio");
      const $ = cheerio.load(response.data);
      $(".table-striped tbody > tr").each((atRes, val) => {
        const $1 = cheerio.load(val);
        $1("td").next((atChannel, val1) => {
          const $2 = cheerio.load(val1);
          $2("span").each((pos, res) => {
            data[atChannel][atRes].push($(res).text().trim());
          });
        });
      });
    })
    .catch(console.error);

  const allRewards = {
    "south": [
      "G8",
      "G7",
      "G6",
      "G5",
      "G4",
      "G3",
      "G2",
      "G1",
      "GĐB"
    ],
    "middle": [
      "G8",
      "G7",
      "G6",
      "G5",
      "G4",
      "G3",
      "G2",
      "G1",
      "GĐB"
    ],
    "north": [
      "Mã ĐB",
      "GĐB",
      "G1",
      "G2",
      "G3",
      "G4",
      "G5",
      "G6",
      "G7"
    ]
  }
  const rewards = allRewards[place];
  for (let atRes = 0; atRes < rewards.length; atRes++) {
    for (let atChannel = 0; atChannel < channels.length; ++atChannel) {
      var tmp = {};
      tmp["reward"] = rewards[atRes];
      tmp["result"] = data[atChannel][atRes];
      data[atChannel][atRes] = tmp;
    }
  }

  for (let atChannel = 0; atChannel < channels.length; ++atChannel) {
    var tmp = {};
    tmp["channel"] = channels[atChannel];
    tmp["data"] = data[atChannel];
    data[atChannel] = tmp;
  }

  return data;
}


router.get("/:place/:date", async (req, res) => {
  try {
    const { place, date } = req.params;
    const data = await getResult(place, date);
    res.json(data);
  } catch(err) {
    console.log(err);
    res.status(500).json({
      message: "Server error"
    });
  }
});

module.exports= router;
