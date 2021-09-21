import { readFileSync } from "fs";
import { TsvOpener } from "./tsvReader";

const headerHunter = `This data contains the following columns`;
let plotly = require('plotly')("Gerald12344", "RU6MoLpi7SMkiDJiJqrR")

// Types for the weather
interface weatherType {
    timestamp: number;
    atmospheric_pressure: number;
}

// Types for events
interface events {
    timestamp: number;
    pulseheights_0: number;
    pulseheights_1: number;
    pulseheights_2: number;
    pulseheights_3: number;
}

// Pressure types 
interface pressureKey {
    [key: number]: number
}

// Main output 
interface mainOuput {
    timestamp: string;
    pulseHeight: number;
    pressure: number
}

let InputEvents = TsvOpener(readFileSync("./data/events.tsv", { encoding: 'utf8', flag: 'r' }), headerHunter).map((e: events) => {
    return { timeStamp: e.timestamp, average_pulseheight: (e.pulseheights_0 + e.pulseheights_1 + e.pulseheights_2 + e.pulseheights_3) / 4 }
})

let InputWeather = TsvOpener(readFileSync("./data/weather.tsv", { encoding: 'utf8', flag: 'r' }), headerHunter).map((e: weatherType) => {
    return { timeStamp: e.timestamp, pressure: e.atmospheric_pressure }
})

// Now build table
let mainPressure: pressureKey = {}
let pressureArray: number[] = []
InputWeather.forEach((e) => {
    mainPressure[e.timeStamp] = e.pressure
    pressureArray[e.pressure] = 0
})

let joinedOutput: mainOuput[] = []


InputEvents.forEach((e) => {
    let stop = false

    let recursiveFunc = (val: number): void | number => {
        let pressure = mainPressure[val]
        if (pressure === undefined && stop === false) {
            val += 1
            recursiveFunc(val)
        } else {
            stop = true
            return pressure
        }
    }

    let pressure = recursiveFunc(e.timeStamp) as number | undefined
    if (pressure === undefined) return;

    //pulseHeight: e.average_pulseheight,
    pressureArray[pressure]++
    joinedOutput.push({
        timestamp: new Date(e.timeStamp).toLocaleTimeString(),
        pulseHeight: e.average_pulseheight,
        pressure,
    })
})

/*
let items: number[] = []
let count: number[] = []

pressureArray.forEach((e, i) => {
    if (e !== undefined) {
        items.push(i)
        count.push(e)
    }
})
*/

//console.log(joinedOutput)


let dataX: number[] = []
let dataY: number[] = []
pressureArray.forEach((e, i) => {
    console.log(e, i)
    dataX.push(e)
    dataY.push(i)
})

var trace1 = {
    x: dataY,
    y: dataX,
    type: "scatter",
    mode: "markers",
    name: "Pressure vs Pulse Height"
};

console.log(pressureArray)

let graphOptions = { filename: "basic-scatter", fileopt: "overwrite", };
plotly.plot([trace1], graphOptions, function (err, msg) {
    console.log(err, msg);
});