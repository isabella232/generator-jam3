var fs = require( 'fs' );

module.exports = {

	<% 

	sections.forEach( function( section, sIdx, sArray ) {

		var fileName = sectionFromRoute( section );

		%>'<%= section %>': { <%

			templates.forEach( function( template, tIdx, tArray ) {

				%><%= template %>: fs.readFileSync( __dirname + '/<%= fileName + "." + template %>' )<% 

				if( tIdx < tArray.length - 1 ) { 
					%>, <%  
				}
			});
		%> }<%

		if( sIdx < sArray.length - 1 ) {

			%>, 
	<%
		}
	});
	%>
};