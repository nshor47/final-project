async function loadData() {
    const foodWasteData = await d3.csv('Food Waste data and research - by country.csv');
    const foodInsecurityData = await d3.csv('FAOSTAT_data_en_11-19-2024.csv');
    
    createFoodWasteChart(foodWasteData);
    createFoodInsecurityChart(foodInsecurityData);
    console.log(foodWasteData);
    console.log(foodInsecurityData);
}

loadData();

//Vis 1
const createFoodWasteChart = (data) => {
    const margin = { top: 40, right: 40, bottom: 100, left: 100 }; 
    const width = 1000 - margin.left - margin.right;  
    const height = 600 - margin.top - margin.bottom; 

    const svg = d3.select("#food-waste-chart")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

    const filteredData = data.filter(d => d['Confidence in estimate'] === "High Confidence");

    const sectors = ['Household estimate (kg/capita/year)', 
                     'Retail estimate (kg/capita/year)', 
                     'Food service estimate (kg/capita/year)'];

    const stackData = d3.stack()
        .keys(sectors)
        (filteredData);

    const x = d3.scaleBand()
                .domain(filteredData.map(d => d.Country))
                .range([0, width])
                .padding(0.2); 

    const y = d3.scaleLinear()
                .domain([0, d3.max(stackData.flat(), d => d[1]) * 1.2])
                .nice()
                .range([height, 0]);

    const color = d3.scaleOrdinal()
                    .domain(sectors)
                    .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

    svg.selectAll(".series")
        .data(stackData)
        .enter().append("g")
        .attr("fill", (d) => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .enter().append("rect")
        .each(function(d) {
            const x = d3.scaleBand()
                .domain(filteredData.map(d => d.Country))
                .range([0, width])
                .padding(0.1);

            d3.select(this)
                .attr("x", () => x(d.data.Country))
                .attr("y", () => y(d[1]))
                .attr("height", () => y(d[0]) - y(d[1]))
                .attr("width", x.bandwidth());
        });

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x)
            .tickSizeOuter(0)
            .tickFormat((d) => d)
        )
        .selectAll("text")
        .attr("transform", "rotate(0)")
        .attr("text-anchor", "middle")
        .attr("x", 0)
        .attr("y", 10)
        .style("font-size", "9px");

    const yAxisGroup = svg.append("g")
        .call(d3.axisLeft(y));

    yAxisGroup.append("text")
        .attr("transform", "rotate(-90)")  
        .attr("y", -50)  
        .attr("x", -height / 2)  
        .attr("dy", "1em")  
        .style("text-anchor", "middle")  
        .style("font-size", "14px")  
        .text("Food Waste (kg/capita/year)")  
        .style("fill", "black"); 
    
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("text-anchor", "middle")
        .text("Country")
        .style("font-size", "14px");

    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 180}, 20)`);

    legend.selectAll("g")
        .data(sectors)
        .enter().append("g")
        .attr("transform", (d, i) => `translate(0, ${i * 25})`);

    legend.selectAll("g")
        .append("circle")
        .attr("r", 10)
        .attr("fill", color);

    legend.selectAll("g")
        .append("text")
        .attr("x", 16)
        .attr("y", 5)
        .text(d => d)
        .style("font-size", "12px");  
};

// Vis 2
const createFoodInsecurityChart = (data) => {
    const margin = { top: 40, right: 40, bottom: 120, left: 60 };
    const width = 1000 - margin.left - margin.right;  
    const height = 600 - margin.top - margin.bottom;

    const svg = d3.select("#food-insecurity-chart")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                .append("g")
                  .attr("transform", `translate(${margin.left},${margin.top})`);

    const filteredData = data.filter(d => d.country === "USA");

    const x = d3.scaleTime()
                .domain(d3.extent(filteredData, d => new Date(d.year)))
                .range([0, width]);

    const y = d3.scaleLinear()
                .domain([0, d3.max(filteredData, d => +d.insecure_percentage) * 1.2]) // Expanded y-domain
                .nice()
                .range([height, 0]);

    const line = d3.line()
                   .x(d => x(new Date(d.year)))
                   .y(d => y(+d.insecure_percentage));

    svg.append("path")
        .data([filteredData])
        .attr("class", "line")
        .attr("d", line)
        .style("stroke", "steelblue")
        .style("stroke-width", 3)  
        .style("fill", "none");

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(d3.timeYear.every(1)))
        .selectAll("text")
        .style("font-size", "14px")  
        .attr("transform", "rotate(-45)")
        .attr("text-anchor", "end")
        .attr("x", -15)
        .attr("y", 10);

    svg.append("g")
        .call(d3.axisLeft(y))
        .style("font-size", "14px");  

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("text-anchor", "middle")
        .text("Year")
        .style("font-size", "14px");  

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Food Insecurity (%)")
        .style("font-size", "14px");  

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .text("Food Insecurity Over Time (USA)")
        .style("font-size", "18px")
        .style("font-weight", "bold");
};