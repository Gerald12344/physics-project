

export function TsvOpener(data: string, headerHunter: string): unknown[] {

    // declare local scope variables
    let headings: string[] = [];
    let output: unknown[] = [];
    let passedHeadingStart: boolean = false;
    let headingSkip: boolean = false;
    let passedHeadings: boolean = false;

    data.split("\n").forEach((item) => {
        if (item.startsWith("#")) {
            // Comment / header
            if (item.indexOf(headerHunter) !== -1) {
                passedHeadingStart = true;

                return;
            }

            const clean = item.trim().replace(new RegExp("#", "g"), "");

            if (
                passedHeadingStart &&
                clean.replace(new RegExp(" ", "g"), "").length === 0
            ) {
                // This is a spacer
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
                    const count = parseInt(
                        name
                            .substring(name.indexOf("(") + 1)
                            .replace("x", "")
                            .replace(")", "")
                    );
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
            splitData.forEach((dataValue:unknown) => {
                const heading = headings[i++];

                switch (heading) {
                    case "date": {
                        dataValue = new Date(dataValue as Date);
                        break;
                    }
                    default: {
                        dataValue = parseInt(dataValue as string);
                        break;
                    }
                }

                constructingObject[heading] = dataValue;
            });

            output.push(constructingObject);
        }
    });

    return output
}