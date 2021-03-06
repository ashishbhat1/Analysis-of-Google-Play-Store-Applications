class PieChartI {

    constructor(parentElement, data, config) {
        this.parentElement = parentElement;
        this.data = data;
        this.config = config;
        this.displayData = data;
        this.displayData2 = data;
        this.circleColors = ['#003f5c', '#58508d', '#bc5090', '#ff6361', '#ffa600'];


        this.initVis();
    }




    /*
     * Initialize visualization (static content; e.g. SVG area, axes)
     */

    initVis() {
        let vis = this;

        vis.margin = {top: 10, right: 10, bottom: 10, left: 10};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // add title
        vis.svg.append('g')
            .attr('class', 'title pie-title')
            .append('text')
            .text("Distribution of All Applications by " + vis.config.title)
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');


        // TODO
        // pie chart setup
        vis.pieChartGroup = vis.svg
            .append('g')
            .attr('class', 'pie-chart')
            .attr("transform", "translate(" + vis.width / 2 + "," + vis.height / 2 + ")");


        vis.pie = d3.pie()
            .value(d => d.value);


        // Pie chart settings
        vis.outerRadius = vis.width / 4;
        vis.innerRadius = 0;

        // Path generator for the pie segments
        vis.arc = d3.arc()
            .innerRadius(vis.innerRadius)
            .outerRadius(vis.outerRadius);

        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'pieTooltip');



        // call next method in pipeline
        vis.wrangleData();
    }




    /*
     * Data wrangling
     */

    wrangleData() {
        let vis = this;

        // (1) Group data by key variable (e.g. 'electricity') and count leaves
        // (2) Sort columns descending

        vis.rollupValue = d3.rollup(vis.displayData, leaves=>leaves.length, d=>d[vis.config.key]);
        vis.arrayValue = Array.from(vis.rollupValue, ([key, value]) => ({key, value}));

        vis.sorted= vis.arrayValue.sort((a,b) => b.value - a.value);

        // * TO-DO *

        vis.displayData2 = []

        // generate random data
        if (vis.sorted.length < 5){
            for (let i = 0; i < vis.sorted.length; i++) {
                let random = vis.sorted[i].value
                vis.displayData2.push({
                    value: random,
                    string: vis.sorted[i].key,
                    color: vis.circleColors[i]
                })
            }
        }
        else{
            for (let i = 0; i < 5; i++) {
                let random = vis.sorted[i].value
                vis.displayData2.push({
                    value: random,
                    string: vis.sorted[i].key,
                    color: vis.circleColors[i]
                })
            }
        }




        // Update the visualization
        vis.updateVis();
    }



    /*
     * The drawing function - should use the D3 update sequence (enter, update, exit)
     */

    updateVis() {
        let vis = this;

        vis.arcChart = vis.pieChartGroup.selectAll(".arc")
            .data(vis.pie(vis.displayData2))



        vis.arcChart.enter()
            .append("path")
            .attr("class", "arc")
            .merge(vis.arcChart)
            .attr("d", vis.arc)
            .attr("fill", d => d.data.color)
            .on('mouseover', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black')
                    .attr('fill', 'rgba(173,222,255,0.62)')
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                        <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                             <h3> Kind: ${d.data.string}<h3>
                             <h4> Counts: ${d.value}</h4>                            
                         </div>`);
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '0px')
                    .attr("fill", d => d.data.color)
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });


        vis.arcChart.exit().remove();

        let legendHeight = 13,
            interLegend = 4,
            colorWidth = legendHeight * 2;

        vis.nodes = []
        for (let i = 0; i < vis.displayData2.length; i++) {
            vis.nodes.push({
                name: vis.displayData2[i].string,
                color: vis.displayData2[i].color
            })
        }
        while (vis.nodes.length != 5){
            vis.nodes.push({
                name: "",
                color: "#DEF2F1"
            })
        }
        // vis.nodes = [
        //         {'name': vis.displayData2[0].string, 'color':vis.displayData2[0].color},
        //         {'name': vis.displayData2[1].string, 'color':vis.displayData2[1].color},
        //         {'name': vis.displayData2[2].string, 'color':vis.displayData2[2].color},
        //         {'name': vis.displayData2[3].string, 'color':vis.displayData2[3].color},
        //         {'name': vis.displayData2[4].string, 'color':vis.displayData2[4].color},
        //     ];


        vis.legendContainer = vis.svg
            .append("g")
            .classed("legend", true)
            .attr("transform", "translate(" + [0, vis.height - 20] + ")");

        vis.legends = vis.legendContainer
            .selectAll(".legend")
            .data(vis.nodes);

        vis.legend = vis.legends
            .enter()
            .append("g")
            .attr("class", "legend")
            .merge(vis.legends)
            .attr("transform", function (d, i) {
                return "translate(" + [0, -i * (legendHeight + interLegend)] + ")";
            })

        vis.legend
            .append("rect")
            .classed("legend-color", true)
            .attr("y", -legendHeight)
            .attr("width", colorWidth)
            .attr("height", legendHeight)
            .style("fill", function (d) {
                return d.color;
            });

        vis.label = vis.svg.selectAll(".pie-label")
            .data(vis.nodes);

        vis.label
            .enter()
            .append('text')
            .attr("class", "pie-label")
            .merge(vis.label)
            .attr("transform", function (d, i) {
                return "translate(" + [colorWidth + 5, vis.height - 20 -i * (legendHeight + interLegend)] + ")";
            })
            .text(function (d) {
                return d.name;
            })
            .style("font-size", 12);

        vis.label.exit().remove();


        vis.legendContainer
            .append("text")
            .attr("transform", "translate(" + [0, -vis.nodes.length * (legendHeight + interLegend) - 5] + ")")
            .text(vis.config.title);

        vis.legend.exit().remove();

    }



    /*
     * Filter data when the user changes the selection
     * Example for brushRegion: 07/16/2016 to 07/28/2016
     */

    selectionChanged(brushRegion) {
        let vis = this;

        // Filter data accordingly without changing the original data
        // * TO-DO *
        vis.displayData = []

        vis.displayData = vis.data.filter(function(d) {
            return ((d.LastUpdated >= brushRegion[0]) && (d.LastUpdated <= brushRegion[1]))
        });

        console.log(vis.displayData)

        // Update the visualization
        vis.wrangleData();
    }
}