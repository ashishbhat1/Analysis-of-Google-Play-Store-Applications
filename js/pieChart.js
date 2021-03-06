/* * * * * * * * * * * * * *
*         PieChart         *
* * * * * * * * * * * * * */
let countFree = 0;
let countPaid = 0;
let totalFree = 0;
let totalPaid = 0;

class PieChart {

    constructor(parentElement, textString, data) {
        this.parentElement = parentElement;
        this.textString = textString;
        this.data = data;
        countFree = countPaid = totalPaid = totalFree = 0;


        // call initVis method
        this.initVis()
    }

    initVis() {
        let vis = this;

        // margin conventions
        vis.margin = {top: 50, right: 0, bottom: 50, left: 0};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // add title
        vis.svg.append('g')
            .attr('class', 'title pie-title')
            .append('text')
            .text(vis.textString)
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');


        // TODO
        // pie chart setup
        vis.pieChartGroup = vis.svg
            .append('g')
            .attr('class', 'pie-chart')
            .attr("transform", "translate(" + vis.width / 2 + "," + vis.height / 2 + ")");
            // .scale(230);

        // Pie chart settings
        vis.outerRadius = vis.width / 4;
        vis.innerRadius = 0;      // Relevant for donut charts

        // Define a default pie layout
        vis.pie = d3.pie()
            .value(d => d.value);

        // Path generator for the pie segments
        vis.arc = d3.arc()
            .innerRadius(vis.innerRadius)
            .outerRadius(vis.outerRadius);
            // .scale(230);

        // append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'pieTooltip');
        let legendHeight = 13,
            interLegend = 4,
            colorWidth = legendHeight * 2,
            nodes = [
                {'name': 'Successful Application', 'color':'#EC6B56'},
                {'name': 'Unsuccessful Application', 'color':'#FFC154'},
            ];


        vis.legendContainer = vis.svg
            .append("g")
            .classed("legend", true)
            .attr("transform", "translate(" + [0, vis.height - 20] + ")");

        vis.legends = vis.legendContainer
            .selectAll(".legend")
            .data(nodes)
            .enter();

        vis.legend = vis.legends
            .append("g")
            .classed("legend", true)
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

        vis.legend
            .append("text")
            .classed("tiny", true)
            .attr("transform", "translate(" + [colorWidth + 5, -2] + ")")
            .text(function (d) {
                return d.name;
            })
            .style("font-size", 12);

        vis.legendContainer
            .append("text")
            .attr("transform", "translate(" + [0, -nodes.length * (legendHeight + interLegend) - 5] + ")")
            .text("Category");

        // call next method in pipeline
        this.wrangleData();
    }

    // wrangleData method
    wrangleData() {
        let vis = this;

        vis.data.forEach(function (arrayItem) {
            if (arrayItem.type == "Free" && arrayItem.installs >= 10000000) {
                countFree += 1;
            } else if (arrayItem.type == "Free" && arrayItem.installs < 10000000) {
                totalFree += 1;
            } else if (arrayItem.type == "Paid" && arrayItem.installs >= 10000000) {
                countPaid += 1;
            } else if (arrayItem.type == "Paid" && arrayItem.installs < 10000000) {
                totalPaid += 1;
            }
        });
        if (vis.textString == "Free Applications") {
            vis.mainCount = countFree;
            vis.totalCount = totalFree;
        } else {
            vis.mainCount = countPaid;
            vis.totalCount = totalPaid;
        }
        vis.displayData = [{value: vis.mainCount, color: '#EC6B56'}, {value: vis.totalCount, color: '#FFC154'}];

        vis.updateVis()

    }

    // updateVis method
    updateVis() {
        let vis = this;

        // Bind data
        vis.arcs = vis.pieChartGroup.selectAll(".arc")
            .data(vis.pie(vis.displayData));

        // Append paths
        vis.arcs.enter()
            .append("path")
            .merge(vis.arcs)
            .attr("d", vis.arc)
            .style("fill", function(d, index) { return d.data.color; })

            .on('mouseover', function(event, d){
                console.log(d);
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
                            <h4>Number of ${d.data.color == "#EC6B56" ? "Successful" : "Unsuccessful"} Applications: <h4>
                            <h4>${d.value}</h4>                         
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
            })

    }
}
