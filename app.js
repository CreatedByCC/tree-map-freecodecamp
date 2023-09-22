import * as d3 from "https://cdn.skypack.dev/d3@7.8.4";

const games_url = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json';
const movies_url = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json';
const pledges_url = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json';

function drawMap(dataset) {
    //dimensions
    const width = 1300;
    const height = 900;

    const canvas = d3.select('#canvas')
        .attr('width', width)
        .attr('height', height);
  
    const hierarchy = d3.hierarchy(dataset, (child) => child.children)   // indicate where to locate the child elements (if there is any) to create a tree
        .sum((child) => child.value)                                     // add the values so that we can determine the size of the box (bigger values will create bigger boxes)
        .sort((child1, child2) => child2.value - child1.value);          // sort the child elements based on values so that the biggest element is created first

    const createTreeMap = d3.treemap()  
        .size([width, height]);
    
        createTreeMap(hierarchy);       // calling the createTreeMap method on hierarchy(dataset) - adds coordinates that will help us draw the tiles
        console.log(hierarchy.leaves());

    const block = canvas.selectAll('g')
        .data(hierarchy.leaves())       // leaves are the elements with no child elements
        .enter()
        .append('g')
        .attr('transform', (d) => `translate(${d.x0}, ${d.y0})`);
    
    const categories = Array.from(new Set(hierarchy.leaves().map((d) => d.data.category)));     // to determine how many categories there are
    
    const color = d3.scaleOrdinal()     // assigning colors to each category
        .domain(categories)
        .range(d3.schemeSet3);

    // tooltip
    const tooltip = d3.select('#tooltip')
        .style('opacity', 0); 
    
    // draw the blocks for each category    
    block.append('rect')
        .attr('class', 'tile')
        .attr('data-name', (d) => d.data.name)
        .attr('data-category', (d) => d.data.category)
        .attr('data-value', (d) => d.data.value)
        .attr('width', (d) => d.x1 - d.x0)
        .attr('height', (d) => d.y1 - d.y0)
        .attr('fill', (d) => color(d.data.category))
        .on('mouseover', (e, d) => {    
            tooltip.transition().style('opacity', 0.9);
            tooltip.attr('data-value', d.data.value);
            tooltip
              .html(`Name: ${d.data.name} <br/> Category: ${d.data.category} <br/> Value: ${d.data.value}`)
              .style('left', `${e.pageX + 10}px`)
              .style('top', `${e.pageY - 28}px`);
        })
        .on('mouseout', (d) => {
            tooltip.transition().style('opacity', 0);
        });
    
    // add the text to each block
    block.append('text')
        .attr('class', 'tile-text')
        .attr('x', 0)
        .attr('y', 0)
        .selectAll('tspan')     // to place the text on more than 1 line
        .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
        .enter()
        .append('tspan')
        .attr('x', 5)
        .attr('dy', '1.2em')
        .text((d) => d);
    
    // legend
    const legend = d3.select('#legend')
        .attr('transform', `translate(20, 80)`);

    const legendGroup = legend.selectAll('g')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('transform', (d, i) => `translate(0, ${i * 30})`);

    legendGroup.append('rect')
        .attr('class', 'legend-item')
        .attr('width', 25)
        .attr('height', 25)
        .attr('fill', (d) => color(d));

    legendGroup.append('text')
        .text((d) => d)
        .attr('x', 32)
        .attr('y', 19)
        .style('font-size', '0.9rem');

};

async function getData() {
    const resp = await fetch(games_url);
    const data = await resp.json();

    console.log(data);
    drawMap(data);
}

getData();