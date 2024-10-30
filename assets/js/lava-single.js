( function( window, $, undef ) {
	"use strict";

	var lava_detail_item = function() {
		var
			opt = lava_core_single_params,
			param = opt.param,
			lat = parseFloat( opt.maps.lat ) || 0,
			lng = parseFloat( opt.maps.lng ) || 0,
			radius = parseInt( opt.maps.radius ) || 0,
			panel = opt.maps.panel,
			marker_icon	= opt.maps.panel.markerIcon;

		this.el = $( opt.map );
		this.street = $( opt.street );
		this.slider = $( opt.slider );
		this.param = opt;
		this.lat = lat;
		this.lng = lng;
		this.latLng = new google.maps.LatLng( lat, lng );
		this.pano = new google.maps.StreetViewService;
		this.radius = radius;
		this.panel = panel;
		this.marker_icon = marker_icon;
		this.fullWidth = opt.maps.fullWidth || false;

		if( ! this.instance )
			this.init();
	}	

	lava_detail_item.prototype = {

		constructor: lava_detail_item,
			
		init : function() {
			var obj = this;
			obj.instance = true;
			$( document ).ready( obj.document_loaded() );
		},
			
		setCoreMapContainer : function( allowPanorama ) {

			var
				obj = this,
				el = obj.el,
				elStreetview = obj.street,
				latLng = obj.latLng,
				param = obj.param,
				iMapHeight = param.maps.mapHeight || 300,
				iStreetHeight = param.maps.streetViewHeight || 500,
				usePanorama = param.maps.street_visible || 0,
				isLat = parseFloat( param.maps.street_lat || 0 ),
				isLng = parseFloat( param.maps.street_lng || 0 ),
				isHeading = parseFloat( param.maps.street_heading || 0 ),
				isPitch = parseFloat( param.maps.street_pitch || 0 ),
				isZoom = parseFloat( param.maps.street_zoom || 0 ),
				isNotloaded = param.strings.strNotStreetview,
				isLatLng = new google.maps.LatLng( isLat, isLng );

			obj.panoramaAllow			= false

			var options		= {
				map : {
					options : {
						center					: latLng
						, mapTypeId				: google.maps.MapTypeId.ROADMAP
						, mapTypeControl		: true
						, panControl			: false
						, scrollwheel			: false
						, draggable				: true
						, streetViewControl		: true
						, zoomControl			: true
					}
				}
				, panel							: {
					options						: { content: "<div id=\"lava-Di-map-panel\"></div>" }
					, top						: true
					, left						: true
				}
			}

			if( obj.street.length && usePanorama && isLat && isLng && allowPanorama ) {
				obj.panoramaAllow						= true;
				options.streetviewpanorama		= {
					options						: {
						container				: obj.street.get(0)
						, opts					: { position : isLatLng, pov : { heading : isHeading, pitch : isPitch, zoom : isZoom } }
					}
				}
			}else{
				obj.street.html( isNotloaded ).css({ textAlign: 'center' });
			}

			if( obj.radius )
			{
				options.map.options.zoom		= 16;
				options.circle					= {
					options						: { center : latLng, radius : obj.radius, fillColor : "#008BB2", strokeColor : "#005BB7" }
				}

			}else{

				options.map.options.zoom		= 16;
				options.marker					= {
					latLng						: latLng
					, options					: { icon : obj.marker_icon }
				}
			}

			$( window ).on(
				'resize'
				, function(){

					el.css( 'height', parseInt( iMapHeight ) );

					if( elStreetview.length )
						elStreetview.css( 'height', parseInt( iStreetHeight ) );

				}
			).trigger( 'resize' );

			if( this.panel )
				options.panel					= false;

			this.map							= el.gmap3( options );

			if( ! this.panel ) {
				$( "#lava-Di-map-panel-inner" )	.appendTo( '#lava-Di-map-panel' );

				this.getPlaceService(
					$( ".lava-Di-locality" )
					, "restaurant|movie_theater|bar"
					, $( '.lava-Di-map-filter' )

				);

				this.getPlaceService(
					$( ".lava-Di-commutes" )
					, "airport|bus_station|train_station"
				);

			}

			$( document ).trigger( 'lava:single-msp-setup-after', this );

			return this;
		},
			
		getPlaceService : function( el, filterKeyword, trigger ) {
			var
				results
				, places		= {}
				, obj			= this
				, filters		= filterKeyword.split( "|" );

			var callback = function( response )
			{
				if( "OK" === response.result.status )
				{
					results = response.result.results;

					$.each(
						results
						, function( place_index, place_meta )
						{
							if( filters ) {
								for( var j  in filters )
									if( place_meta.types.indexOf( filters[ j ] ) > -1 )
										if( typeof places[ filters[ j ] ] == "undefined" ) {
											places[ filters[ j ] ] = new Array( place_meta );
										}else{
											places[ filters[ j ] ].push( place_meta );
										}
							}
						}
					); // End results each

					$.each(
						places
						, function( type_name, types )
						{
							var str = "";
							$.each(
								types
								, function( item_index, place_item )
								{
									var parseDistance = function( index, length ){
										return function( result, STATUS )
										{
											if( STATUS === "OK" )
											{
												var meta = result.rows[0].elements[0];

												if( meta.status === "OK" ) {
													str += "<li>";
														str += "<div>";
															str += "<div>";
																str += place_item.name;
															str += "</div>";
															str += "<div>";
																str += meta.distance.text + "/" + meta.duration.text;
															str += "</div>";
														str += "</div>";
													str += "</li>";
												}

												if( index == length )
													$( el.selector + "[data-type='" + type_name + "']" ).html( str );
											}
										}
									}

									obj.map.gmap3({
										getdistance:{
											options:{
												origins			: [ obj.latLng ]
												, destinations	: [ place_item.geometry.location ]
												, travelMode	: google.maps.TravelMode.DRIVING
											}
											, callback : parseDistance( item_index, ( types.length -1) )
										}
									});	// End Gmap3

								}
							); // End place item each

						}
					); // End Types each
				}
			}

			obj.getPlacesJSON( filterKeyword, callback );
		},
			
		getPlacesJSON : function( args, callback ) {
			var obj = this;

			$.getJSON(
				$( "[data-admin-ajax-url]" ).val()

				, {
					action		: 'lava_single_place_commute'
					, nonce		: $( "[data-ajax-nonce]" ).val()
					, types		: args
					, lat		: obj.latLng.lat()
					, lng		: obj.latLng.lng()
				}

				, function( response )
				{
					if( ! response.error ) {
						if( typeof callback == "function" )
							callback( response );
					}else{
						jQuery.lava_msg({ content: response.error });
					}
				}
			)
			.fail(
				function( response )
				{
					console.log( response.responseText );
				}
			);
		},
			
		setCompareDistance : function ( p1, p2 ) {
			// Google Radius API
			var R = 6371;
			var dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
			var dLon = (p2.lng() - p1.lng()) * Math.PI / 180;
			var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(p1.lat() * Math.PI / 180) * Math.cos(p2.lat() * Math.PI / 180) *
			Math.sin(dLon / 2) * Math.sin(dLon / 2);
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
			var d = R * c;
			return d;
		},
			
		availableStreeview : function() {
			var
				obj = this,
				pano = obj.pano,
				param = obj.param,
				streetPosition	= new google.maps.LatLng(
					parseFloat( param.maps.street_lat || 0 )
					, parseFloat( param.maps.street_lng || 0 )
				);

			// param1: Position, param2: Round, param3: callback
			pano.getPanoramaByLocation( streetPosition, 50
				, function( result, state ) {
					obj.setCoreMapContainer( state === google.maps.StreetViewStatus.OK )
				}
			);
			return this;
		},
			
		attach_slider : function() {

			var
				obj			= this
				, el		= obj.slider;

			$( document ).ready(
				function() {
					el
						.removeClass( 'hidden' )
						.flexslider( {
							animation		: 'slide'
							, controlNav	: false
							, slideshow		: true
						} );
				}
			);

		},
			
		document_loaded : function() {
			var
				obj= this,
				strings = obj.param.strings,
				mapNotLoaded = strings.strNotLocation;

			return function() {
				if( obj.el.length )
					if( obj.lat && obj.lng ) {
						obj.availableStreeview();
					}else{
						obj.el.html( mapNotLoaded );
					}

				if( obj.slider.length )
					obj
						.attach_slider();

			}
		}
	}
	new lava_detail_item;
} )( window, jQuery );