document.addEventListener('DOMContentLoaded', function() {
    Plotly.d3.csv("sorted_dataset.csv", function(err, rows) {
        if (err) {
            console.error('Error loading CSV file', err);
            return;
        }

        function unpack(rows, key) {
            return rows.map(row => row[key]);
        }

        console.log(rows); // Check the raw data from CSV

        const uniqueDates = [...new Set(unpack(rows, 'Date'))].sort();
        const buildings = [...new Set(unpack(rows, 'Building'))];
        const streams = ['Compost', 'Landfill', 'Recycling'];

        console.log("Streams found in data:", streams); // Verify streams are correctly identified

        let allFrames = [];
        let cumulativeData = streams.map(() => buildings.map(() => 0));

        uniqueDates.forEach((date, index) => {
            let frameData = rows.filter(row => row.Date === date);
            console.log("Data for date " + date + ":", frameData); // Check data for each date

            let traces = streams.map((stream, streamIndex) => {
                let yData = buildings.map((building, buildingIndex) => {
                    let buildingData = frameData.filter(row => row.Building === building && row.Stream === stream);
                    let sumWeight = buildingData.reduce((acc, curr) => acc + parseFloat(curr.Weight), 0);
                    cumulativeData[streamIndex][buildingIndex] += sumWeight;
                    return cumulativeData[streamIndex][buildingIndex];
                });

                console.log(stream + " data for " + date + ":", yData); // Output calculated data per stream

                return {
                    x: buildings,
                    y: yData,
                    name: stream,
                    type: 'bar',
                    marker: {
                        color: streamIndex === 0 ? '#1f77b4' : streamIndex === 1 ? '#ff7f0e' : '#2ca02c'
                    }
                };
            });

            allFrames.push({
                name: date,
                data: traces
            });
        });

        let initialData = allFrames[0].data;

        let layout = {
            title: 'Trace to Tomorrow: Unfolding the Trajectory of Waste Management',
            xaxis: {title: 'Buildings', type: 'category', showgrid: false},
            yaxis: {title: 'Cumulative Weight', automargin: true, showgrid: false},
            barmode: 'group',
            updatemenus: [{
                type: 'buttons',
                showactive: true,
                x: -0.1,
                y: -0.1,
                xanchor: 'center',
                yanchor: 'bottom',
                buttons: [{
                    method: 'animate',
                    args: [null, {mode: 'immediate', fromcurrent: true, transition: {duration: 1500}, frame: {duration: 2000, redraw: true}}],
                    label: 'Play'
                }, {
                    method: 'animate',
                    args: [[null], {mode: 'immediate', frame: {duration: 0}}],
                    label: 'Pause'
                }]
            }],
            sliders: [{
                pad: {t: 50},
                currentvalue: {
                    visible: true,
                    prefix: 'Year: ',
                    xanchor: 'right'
                },
                steps: uniqueDates.map((date, i) => ({
                    method: 'animate',
                    label: date,
                    args: [[date], {
                        mode: 'immediate',
                        transition: {duration: 3000},
                        frame: {duration: 4000, redraw: true}
                    }]
                }))
            }]
        };

        Plotly.newPlot('plot', initialData, layout).then(function() {
            Plotly.addFrames('plot', allFrames);
        });
    });
});
