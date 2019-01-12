let width = (height = 100),
  x = d3
    .scaleLinear()
    .domain([0, width])
    .range([0, width]),
  y = d3
    .scaleLinear()
    .domain([0, height])
    .range([0, height]),
  color = d3
    .scaleOrdinal()
    .range(d3.schemeCategory10.map(c => (c = d3.rgb(c)))),
  treemap = d3
    .treemap()
    .size([width, height])
    .paddingInner(0)
    .round(false),
  url =
    "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json",
  data = [];

fetch(url)
  .then(response => response.json())
  .then(function(receivedData) {
    data = receivedData;

    let nodes = d3.hierarchy(data).sum(d => (d.value ? 1 : 0));

    let currentDepth;
    treemap(nodes);

    let tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .attr("id", "tooltip")
      .style("opacity", 0);

    let chart = d3.select("#legend");
    let cells = chart
      .selectAll("rect")
      .data(nodes.descendants())
      .enter()
      .append("rect")
      .attr("class", d =>
        d.depth === 1
          ? "legend-item tile level-" + d.depth
          : "tile level-" + d.depth
      )
      .attr("data-name", d => {
        if (d.data.name != null) {
          return d.data.name;
        }
        return 0;
      })
      .attr("data-category", d => {
        if (d.data.category != null) {
          return d.data.category;
        }
        return 0;
      })
      .attr("data-value", d => {
        if (d.data.value != null) {
          return d.data.value;
        }
        return 0;
      });

    cells
      .style("left", d => x(d.x0) + "%")
      .style("top", d => y(d.y0) + "%")
      .style("width", d => x(d.x1) - x(d.x0) + "%")
      .style("height", d => y(d.y1) - y(d.y0) + "%")
      .attr("fill", d => {
        while (d.depth > 1) d = d.parent;
        return color(d.data.name);
      })
      .style("background-color", d => {
        while (d.depth > 1) d = d.parent;
        return color(d.data.name);
      })
      .style("border", "1px solid #696969")
      .on("mouseover", d => {
        tooltip.style("opacity", 0.9);
        tooltip.style("z-index", 100);
        tooltip
          .attr("data-value", d.data.value)

          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY - 28 + "px");
        if (d.depth != 1) {
          return tooltip.html(
            d.data.name + "<br>" + d.data.category + "<br>" + d.data.value
          );
        } else {
          return tooltip.html(d.data.name);
        }
      })
      .on("mouseout", d => {
        tooltip.style("opacity", 0);
      })
      .on("click", zoom)
      .append("p")
      .attr("class", "label")
      .text(function(d) {
        return d.data.name ? d.data.name : "---";
      });

    var parent = d3
      .select(".up")
      .datum(nodes)
      .on("click", zoom);

    function zoom(d) {
      currentDepth = d.depth;
      parent.datum(d.parent || nodes);

      x.domain([d.x0, d.x1]);
      y.domain([d.y0, d.y1]);

      var t = d3
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut);

      cells
        .transition(t)
        .style("left", d => x(d.x0) + "%")
        .style("top", d => y(d.y0) + "%")
        .style("width", d => x(d.x1) - x(d.x0) + "%")

        .style("height", d => y(d.y1) - y(d.y0) + "%");

      cells
        .filter(d => d.ancestors())
        .classed("hide", d => (d.children ? true : false));

      cells.filter(d => d.depth > currentDepth).classed("hide", false);
    }
  });
