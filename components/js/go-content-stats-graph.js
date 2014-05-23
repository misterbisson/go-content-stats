( function ( $ ) {
	go_content_stats.graph = {};
	go_content_stats.graph.event = {};

	/**
	 * initialize the graphs for stats
	 */
	go_content_stats.graph.init = function() {
		this.$top_graph = $( '#top-graph' );
		this.$chart = this.$top_graph.find( '#chart' );
		this.$pv_axis = this.$top_graph.find( '#y-axis-left' );
		this.$comment_axis = this.$top_graph.find( '#y-axis-right' );
		this.top_graph = null;
		this.resize_event_bound = false;

		$( window ).on( 'resize', this.event.resize );
	};

	go_content_stats.graph.top_data = function() {
		var data = {
			comments_per_post: [],
			pvs_per_post: []
		};
		var parse_date = d3.time.format( '%Y-%m-%d' ).parse;

		var labels = {
			when: 'When',
			comments_per_post: 'Comments per post',
			pvs_per_post: 'Page view per post (in thousands)'
		};

		for ( var i in go_content_stats.stats ) {
			var item = go_content_stats.stats[ i ];

			item.xaxis = parseInt( moment( item.xaxis ).format( 'X' ), 10 );
			item.comments_per_post = item.comments_per_post ? item.comments_per_post : 0;
			item.pvs_per_post = item.posts && item.pvs ? ( item.pvs / item.posts ) : 0;

			data.comments_per_post.push( {
				x: item.xaxis,
				y: item.comments_per_post
			} );

			data.pvs_per_post.push( {
				x: item.xaxis,
				y: item.pvs_per_post
			} );
		}//end for

		return data;
	};

	go_content_stats.graph.render_top_graph = function() {
		this.$chart.html( '' );
		this.$pv_axis.html( '' );
		this.$comment_axis.html( '' );

		var height = 160;
		var width = this.$chart.width();

		var data = this.top_data();

		var pvs_scale = d3.scale.linear()
			.range( [ 0, 1000 ] )
			.domain( [
				0,
				d3.max( data.pvs_per_post, function( d ) { return d.y; } )
			] );

		var comments_scale = d3.scale.linear()
			.range( [ 0, 1 ] )
			.domain( [
				0,
				d3.max( data.comments_per_post, function( d ) { return d.y; } )
			] );

		var palette = new Rickshaw.Color.Palette( { scheme: 'spectrum14' } );

		this.top_graph = new Rickshaw.Graph( {
			element: this.$chart.get( 0 ),
			width: width,
			height: height,
			renderer: 'line',
			series: [
				{
					color: palette.color(),
					data: data.pvs_per_post,
					name: 'Page views per post (in thousands)',
					scale: pvs_scale
				},
				{
					color: palette.color(),
					data: data.comments_per_post,
					name: 'Comments per post',
					scale: comments_scale
				}
			]
		} );

		this.top_graph.render();

		var pvs_axis = new Rickshaw.Graph.Axis.Y.Scaled( {
			graph: this.top_graph,
			orientation: 'left',
			element: this.$pv_axis.get( 0 ),
			scale: pvs_scale,
			ticks: 6
		} );

		pvs_axis.render();

		var comments_axis = new Rickshaw.Graph.Axis.Y.Scaled( {
			graph: this.top_graph,
			orientation: 'right',
			element: this.$comment_axis.get( 0 ),
			scale: comments_scale,
			ticks: 6
		} );

		comments_axis.render();

		var x_axis = new Rickshaw.Graph.Axis.Time( {
			graph: this.top_graph
		} );

		x_axis.render();

		var hover_detail = new Rickshaw.Graph.HoverDetail( {
			graph: this.top_graph,
			formatter: function( series, x, y ) {
				var date = '<span class="date">' + moment.unix( x ).format( 'MMMM D, YYYY' ) + '</span>';
				var swatch = '<span class="detail-swatch" style="background-color: ' + series.color + '"></span>';
				var content = '<div class="info">' + swatch + series.name + ": " + parseInt( y, 10 ) + '</div>' + date;
				return content;
			}
		} );

		if ( ! this.resize_event_bound ) {
			this.resize_event_bound = true;
		}//end if
	};

	go_content_stats.graph.resize = function() {
		var width = this.$chart.width();
		var height = this.$chart.height();

		this.top_graph.configure( {
			width: width,
			height: height
		} );

		this.top_graph.render();
	};

	go_content_stats.graph.event.resize = function( e ) {
		go_content_stats.graph.resize();
	};
} )( jQuery );
