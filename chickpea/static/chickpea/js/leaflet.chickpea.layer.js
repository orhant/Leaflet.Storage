L.ChickpeaLayer = L.LazyGeoJSON.extend({
    initialize: function (/* Object from db */ category, map, options) {
        this.chickpea_id = category.pk;
        this.chickpea_name = category.name;
        this.chickpea_color = category.color;
        this.iconUrl = category.icon_url;
        this.preset = category.preset;
        this.map = map;
        this.map.chickpea_overlays[this.chickpea_id] = this;
        if(typeof options == "undefined") {
            options = {};
        }
        if(!options.pointToLayer) {
            options.pointToLayer = (function(self) {
                    return function (geojson, latlng) {
                        return L.chickpea_marker(map, geojson.id, latlng, {"geojson": geojson, "overlay": self});
                    }
                })(this);
            }

        L.LazyGeoJSON.prototype.initialize.call(this, this._dataGetter, options);
        if(this.preset) {
            this.map.addLayer(this);
        }
        this.map.chickpea_layers_control.addOverlay(this, this.chickpea_name);
    },
    _dataUrl: function() {
        var template = this.map.options.urls.marker_geojson_list;
        return L.Util.template(template, {"category_id": this.chickpea_id});
    },
    _dataGetter: function () {
        var geojson;
        L.Util.Xhr.get(this._dataUrl(), {
            "async": false, // To be able to return the geojson
            "callback": function(json) {geojson = json;},
            "dataType": "json"
            });
        return geojson;
    },
    addLayer: function (layer) {
        var id = L.Util.stamp(layer); // Id leaflet, not chickpea
                                      // as new marker will be added to
        layer.chickpea_overlay = this;
        layer.options.icon.overlay = this;
        this.map.marker_to_overlay[id] = this;
        return L.LazyGeoJSON.prototype.addLayer.call(this, layer);
    },
    removeLayer: function (layer) {
        var id = L.Util.stamp(layer); // Id leaflet, not chickpea
                                      // as new marker will be added to
        layer.chickpea_overlay = null;
        layer.options.icon.overlay = null;
        delete this.map.marker_to_overlay[id];
        return L.LazyGeoJSON.prototype.removeLayer.call(this, layer);
    }
});