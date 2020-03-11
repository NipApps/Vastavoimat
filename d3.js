		var screenW = window.innerWidth/100*95
		var screenH = window.innerHeight/100*95
		var m = [0, 70, 100, 120]
		var w = parseInt(screenW) - m[1] - m[3]
		var h = parseInt(screenH) - m[0] - m[2]
		var i = 0
		var root
		var vis
      	var getDirection = function(data)
	  	{	if(!data)
		  	{	return 'root';
        	}
			if(data.position)
			{	 return data.position
			}
			return getDirection(data.parent)
		}
		var selectNode = function(target)
		{	if(target)
			{	var sel = d3.selectAll('#body svg .node')
				.filter
				(	function(d)
					{	return d.id == target.id
					}
				)[0][0]
				if(sel)
				{	select(sel)
				}
			}
		}
		const reSizeKartta = (W, H) =>
		{	w = parseInt(W) - m[1] - m[3]
			h = parseInt(H) - m[0] - m[2]
			document.getElementById("body").removeChild(document.getElementById("body").firstChild)
			vis = d3.select("#body")
			.append("svg:svg")
			.attr("width", w + m[1] + m[3])
			.attr("height", h + m[0] + m[2])
			.append("svg:g")
			.attr("transform", "translate(" + (w/2+m[3]) + "," + m[0] + ")")
			loadJsonToD3()
		}
		const loadJsonToD3 = () =>
		{	connector = window['diagonal']
			for (let i=0; i<gloJsonClone.length; i++)
			{	const item = gloJsonClone[i]
				if(item.name === gloCollection)
				{	var jsonItem = item.children
					window.data = root = jsonItem
					root.name = gloYhteisToimintaViesti
					root.x0 = h / 2
					root.y0 = 0				
					jsonItem.left = []
					jsonItem.right = []
					i=1;
					jsonItem.forEach
					(	function(item)
						{	if(i%2)
							{	jsonItem.left.push(item)
								item.position = 'left'
								i=2
							}else
							{	jsonItem.right.push(item)
								item.position = 'right'
								i=1
							}
						}
					)
					update(root, true)
					selectNode(root)
					break
				}
			}
			$("path.link").css("stroke", gloStroke)
		}										
		var select = function(node)
		{	d3.select(".selected").classed("selected", false)
			d3.select(node).classed("selected", true)
		}    
		var handleClick = function(d, index)
		{	index === 0 ? haeTietoIskuModaliin(gloCollection) : haeTietoIskuModaliin(d.name)
			gloClickIndex = index
			gloDoc = d.name
			gloTunnus = d.tunnus			
			select(this)
			update(d)
		}
		var tree = d3.layout.tree().size([h, w])
		var calcLeft = function(d)
		{	var l = d.y
			if(d.position==='left')
			{	l = (d.y) - w/2
				l = (w/2) + l
			}
			return {x : d.x, y : l}
		}
		var diagonal = d3.svg.diagonal()
		.projection
		(	function(d) 
			{	return [d.y, d.x]
			}
		)
		/*
		var elbow = function (d, i)
		{	var source = calcLeft(d.source)
			var target = calcLeft(d.target)
			var hy = (target.y-source.y)/2
			return "M" + source.y + "," + source.x
			+ "H" + (source.y+hy)
			+ "V" + target.x + "H" + target.y
		}
		var connector = elbow
		console.log("c",connector)
		*/
		var vis = d3.select("#body")
		.append("svg:svg")
		.attr("width", w + m[1] + m[3])
		.attr("height", h + m[0] + m[2])
		.append("svg:g")
		.attr("transform", "translate(" + (w/2+m[3]) + "," + m[0] + ")")
		var toArray = function(item, arr, d)
		{	arr = arr || []
			var dr = d || 1
			var i = 0
			var l = item.children?item.children.length:0
			arr.push(item)
			if(item.position && item.position === 'left')
			{	dr = -1
			}
			item.y = dr * item.y
			for(; i < l; i++)
			{	toArray(item.children[i], arr, dr)
			}
			return arr
		}
		function update(source) 
		{   var duration = 300	
			var nodesLeft = tree
			.size([h, (w/2)-20])
			.children
			(	function(d)
				{	return (d.depth === 0) ? d.left:d.children
				}
			)
			.nodes(root)
			.reverse()
			//console.log(nodesLeft)
			var nodesRight = tree
			.size([h, w/2])
			.children
			(	function(d)
				{	return (d.depth === 0) ? d.right:d.children
				}
			)
			.nodes(root)
			.reverse()
			//console.log(nodesRight)
			root.children = root.left.concat(root.right)
			root._children = null
			var nodes = toArray(root)
			var node = vis.selectAll("g.node")
			.data
			(	nodes, 
				function(d) 
				{	return d.id || (d.id = ++i)
				}
			)
			var nodeEnter = node.enter().append("svg:g")
			.attr
			(	"class", 
				function(d)
				{	return d.selected?"node selected":"node"
				}
			)
			.attr
			(	"tunnus", 
				function(d) 
				{	return d.tunnus
				}
			)
			.attr
			(	"transform", 
				function(d) 
				{	return "translate(" + source.y0 + "," + source.x0 + ")"
				}
			)
			.on("click", handleClick)
			nodeEnter.append("svg:circle")
			.attr("r", 1e-6)
			nodeEnter.append("svg:text")
			.attr
			(	"x", 
				function(d) 
				{	return d.children || d._children ? -10 : 10;
				}
			)
			.attr("dy", 14)
			.attr("text-anchor", "middle")
			.text
			(	function(d) 
				{	return (d.name || d.text)
				}
			)
			.style("fill-opacity", 1);
			var nodeUpdate = node.transition()
			.duration(duration)
			.attr
			(	"transform", 
				function(d) 
				{	return "translate(" + d.y + "," + d.x + ")"
				}
			)
			nodeUpdate.select("text")
			.text
			(	function(d) 
				{	return (d.name || d.text)
				}
			)
			nodeUpdate.select("circle")
			.attr("r", 8)
			var nodeExit = node.exit().transition()
			.duration(duration)
			.attr
			(	"transform", 
				function(d) 
				{	return "translate(" + source.y + "," + source.x + ")"
				}
			)
			.remove()
			nodeExit.select("circle")
			.attr("r", 1e-6);
			nodeExit.select("text")
			.style("fill-opacity", 1e-6)
			var link = vis.selectAll("path.link")
			.data
			(	tree.links(nodes), 
				function(d) 
				{	return d.target.id
				}
			)
			link.enter().insert("svg:path", "g")
			.attr("class", "link")
			.attr
			(	"d", 
				function(d) 
				{	var o = {x: source.x0, y: source.y0}
					return connector({source: o, target: o})
				}
			)
			.transition()
			.duration(duration)
			.attr("d", connector)
			link.transition()
			.duration(duration)
			.attr("d", connector)
			link.exit().transition()
			.duration(duration)
			.attr
			(	"d", 
				function(d) 
				{	var o = {x: source.x, y: source.y}
					return connector({source: o, target: o})
				}
			)
			.remove()
			nodes.forEach
			(	function(d) 
				{	d.x0 = d.x
					d.y0 = d.y
				}
			)
		}