var fs = require('fs');
let pressure = fs.readFileSync("json2.json", "utf8");
let data = fs.readFileSync("events.tsv", "utf8")
const headerHunter = `This data contains the following columns`;

const headings = [];
const output = [];

let passedHeadingStart = false;
let headingSkip = false;
let passedHeadings = false;

data.split("\n").forEach(item => {
    if (item.startsWith("#")) { // Comment / header
        if (item.indexOf(headerHunter) !== -1) {
            passedHeadingStart = true;

            return;
        }

        const clean = item.trim().replace(new RegExp("#", "g"), "");

        if (passedHeadingStart && clean.replace(new RegExp(" ", "g"), "").length === 0) { // This is a spacer
            if (!headingSkip) {
                headingSkip = true;

                return;
            }

            if (!passedHeadings) {
                passedHeadings = true;

                return;
            }
        }

        if (passedHeadingStart && !passedHeadings) {
            const subParts = clean.split(":");
            let name = subParts[0].trim();

            if (name.indexOf("(") !== -1) {
                // This means we need to create a bunch of data headers
                const count = parseInt(name.substring(name.indexOf("(") + 1).replace("x", "").replace(")", ""));
                name = name.substring(0, name.indexOf("(")).trim();

                for (let i = 0; i < count; i++) {
                    headings.push(name + "_" + i);
                }

                return;
            }

            headings.push(name);
        }
    } else {
        // This is a datapoint
        let splitData = item.split("\t");

        if (splitData.length === 1) {
            splitData = item.split("    "); // Some IDE's may convert the tabs...
        }

        if (splitData.length <= 1) {
            return; // End of line data probably
        }

        const constructingObject = {};

        let i = 0;
        splitData.forEach(dataValue => {
            const heading = headings[i++];

            switch (heading) {
                case "date": {
                    dataValue = new Date(dataValue);
                    break;
                }
                default: {
                    dataValue = parseInt(dataValue);
                    break;
                }
            }

            constructingObject[heading] = dataValue;
        });

        output.push(constructingObject);
    }
});
console.log('done');
let atmospheric_pressure = JSON.parse(pressure)
for (let i = 0; i < output.length; i++) {
    let iternation = 0;
    if (!(output[i].zenith == '-999')) {
        let sin = Math.sin((output[i].zenith/180)*Math.PI)
        while (true) {
            if (atmospheric_pressure.hasOwnProperty(output[i - iternation].timestamp)) {
                var date = new Date(output[i - iternation].timestamp * 1000);
                var minutes = "0" + date.getMinutes();
                var hours = date.getHours();
                var seconds = "0" + date.getSeconds();
                var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
                let result = atmospheric_pressure[output[i - iternation].timestamp] / sin
                if (result < 0) {
                    result *= -1
                }
                console.log(formattedTime + '\t' + result + '\t' + output[i].zenith + '\t' + atmospheric_pressure[output[i - iternation].timestamp] + '\n')
                break
            } else {
                iternation++
            }
        }
    }
}
/*
let json = {}
let newoutput = []
output.forEach(item => {
  json[item.timestamp] = item.atmospheric_pressure
})
newoutput = JSON.stringify(json)

fs.writeFile('json2.json', newoutput, function(err) {
  if (err) throw err;
  console.log('Saved!');
});
*/