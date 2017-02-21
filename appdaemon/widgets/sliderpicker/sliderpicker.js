function sliderpicker(widget_id, url, parameters)
{
    // Store Args
    this.widget_id = widget_id;
    this.parameters = parameters;
    this.utl = url;
    
    // Add in methods
    this.on_ha_data = on_ha_data;
    this.get_state = get_state;
    this.toggle = toggle;
    this.call_service = call_service;
    
    // Create and initialize bindings
    this.ViewModel = 
    {
        title: ko.observable(parameters.title),
        icon: ko.observable(),
        icon_style: ko.observable(),
        units: ko.observable(),
        level: ko.observable(),
        state_text: ko.observable()
    };
    
    ko.applyBindings(this.ViewModel, document.getElementById(widget_id));

    // Do some setup
    
    this.level_attribute = "level"
    if ("level_attribute" in parameters)
    {
        this.level_attribute = parameters["level_attribute"]
    }
    
    
    this.state_active = "on";
    if ("state_active" in parameters)
    {
        this.state_active = parameters["state_active"]
    }

    this.state_inactive = "off";
    if ("state_inactive" in parameters)
    {
        this.state_inactive = parameters["state_inactive"]
    }
    
    this.min_level = 0;
    if ("min_level" in parameters)
    {
        this.min_level = parameters["min_level"]
    }
    
    this.max_level = 254;
    if ("max_level" in parameters)
    {
        this.max_level = parameters["max_level"]
    }

    this.on_level = (this.max_level - this.min_level) / 2 ;
    this.level = this.min_level;
    
    this.state = this.state_inactive;
    
    if ("on_level" in parameters)
    {
        this.on_level = parameters["on_level"]
    }

    if ("units" in parameters)
    {
        this.ViewModel.units(parameters.units)
    }
    
    this.increment = 25.4
    if ("increment" in parameters)
    {
        this.increment = parameters["increment"]
    }
    
    this.icon_on = "fa-circle";
    if  ("icon_on" in parameters)
    {
        this.icon_on = parameters["icon_on"];
    }

    this.icon_off = "fa-circle-thin";
    if  ("icon_off" in parameters)
    {
        this.icon_off = parameters["icon_off"];
    }
    
    // Setup Override Styles
    
    if ("background_color" in parameters)
    {
        $('#' + widget_id).css("background-color", parameters["background_color"])
    }
        
    if ("icon_size" in parameters)
    {
        $('#' + widget_id + ' > h2').css("font-size", parameters["icon_size"])
    }
    
    if ("title_color" in parameters)
    {
        $('#' + widget_id + ' > h1').css("color", parameters["title_color"])
    }
    
    if ("title_size" in parameters)
    {
        $('#' + widget_id + ' > h1').css("font-size", parameters["title_size"])
    }    

    // Get initial state
    if ("monitored_entity" in parameters)
    {
        entity = parameters.monitored_entity
    }
    else
    {
        entity = parameters.state_entity
    }
    this.get_state(url, entity)

    var that = this
    
    // Define onClick handler for on/off
    if ("post_service_active" in parameters || "post_service_inactive" in parameters)
    {
        $('#' + widget_id + ' > span').click(
            function()
            {
                args = "";
                if (that.state == that.state_active)
                {
                    if ("post_service_inactive" in parameters)
                    {
                        args = parameters["post_service_inactive"]
                    }
                }
                else
                {
                    if ("post_service_active" in parameters)
                    {
                        args = parameters["post_service_active"]
                        if ("on_level" in parameters)
                        {
                            args[that.level_attribute] = round(that, that.on_level)
                        }
                    }
                }
                if (args != "")
                {
                    that.toggle();
                    that.call_service(url, args)
                }
                if ("momentary" in parameters)
                {
                    setTimeout(function() { that.toggle() }, parameters["momentary"])
                }
            }
        )
    }
    // Define onClick handler for Raise level

    $('#' + widget_id + ' #level-up').click(
        function()
        {
            
            that.level = that.level + that.increment;
            if (that.level > that.max_level)
            {
                that.level = that.max_level
            }
            if ("post_service_level" in parameters)
            {
                args = parameters["post_service_level"]
                if ("post_service_level_attribute" in parameters)
                {
                    args[parameters["post_service_level_attribute"]] = round(that, that.level)
                }
                else
                {
                    args[that.level_attribute] = round(that, that.level)
                }
                that.call_service(url, args)   
            }
            else
            {
                args = parameters["post_service_active"]
                if ("post_service_level_attribute" in parameters)
                {
                    args[parameters["post_service_level_attribute"]] = round(that, that.level)
                }
                else
                {
                    args[that.level_attribute] = round(that, that.level)
                }
                that.call_service(url, args)
            }
        }
    )

    // Define onClick handler for Lower level

    $('#' + widget_id + ' #level-down').click(
        function()
        {
            that.level = that.level - that.increment;
            if (that.level < that.min_level)
            {
                that.level = that.min_level
                that.state = that.state_inactive
            }
            if ("post_service_level" in parameters)
            {
                args = parameters["post_service_level"]
                if ("post_service_level_attribute" in parameters)
                {
                    args[parameters["post_service_level_attribute"]] = round(that, that.level)
                }
                else
                {
                    args[that.level_attribute] = round(that, that.level)
                }
                that.call_service(url, args)   
            }
            else
            {
                if (that.state == that.state_inactive)
                {
                    args = parameters["post_service_inactive"]
                    if ("post_service_level_attribute" in parameters)
                    {
                        args[parameters["post_service_level_attribute"]] = round(that, that.level)
                    }
                    else
                    {
                        args[that.level_attribute] = round(that, that.level)
                    }
                    new_view.attributes[that.level_attribute] = round(that, that.on_level)
                    set_view(that, new_view, "")
                }
                else
                {
                    args = parameters["post_service_active"]
                    args[that.level_attribute] = round(that, that.level)
                }
            }

            that.call_service(url, args)
        }
    )

    
    // Methods

    function toggle()
    {
        if (this.state == this.state_active)
        {
            this.state = this.state_inactive;
            if (this.parameters.inactive_level_valid)
            {
                this.level = this.level
            }
            else
            {
                this.level = this.min_level                
            }
        }
        else
        {
            this.state = this.state_active
            if (this.parameters.inactive_level_valid)
            {
                this.level = this.level
            }
            else
            {
                this.level = this.min_level                
            }
        }

        new_view = {"state": that.state_active, "attributes": {}}
        new_view.attributes[that.level_attribute] = this.level
        set_view(this, new_view, "")
    }
    
    function on_ha_data(data)
    {
        if ("monitored_entity" in parameters)
        {
            entity = this.parameters.monitored_entity
        }
        else
        {
            entity = this.parameters.state_entity
        }
        if (data.event_type == "state_changed" && data.data.entity_id == entity)
        {
            state_text = ""
            this.state = data.data.new_state.state
            if (this.level_attribute in data.data.new_state.attributes)
            {
                if (this.level_attribute == "state")
                {
                    this.level = data.data.new_state.state
                }
                else
                {    
                    this.level = data.data.new_state.attributes[this.level_attribute]
                }
            }
            
            if ("state_text_attribute" in this.parameters)
            {
                state_text = data.data.new_state.attributes[this.parameters["state_text_attribute"]]
            }
            set_view(this, data.data.new_state, state_text)
        }
    }
    
    function round(self, value)
    {
        if (self.parameters.round)
        {
            return Math.round(value)
        }
        else
        {
            return value
        }
    }
    
    function call_service(base_url, args)
    {
        var that = this;
        service_url = base_url + "/" + "call_service";
        $.post(service_url, args);    
    }
        
    function get_state(base_url, entity)
    {
        if ("state_entity" in parameters)
        {
            var that = this;
            state_url = base_url + "/state/" + entity;
            $.get(state_url, "", function(data)
            {
                if (data.state == null)
                {
                    that.ViewModel.title("Entity not found")
                }
                else
                {
                    that.state = data.state.state;
                    
                    if (that.level_attribute == "state")
                    {
                        that.level = Number(data.state.state)
                    }
                    else
                    {
                        if (that.level_attribute in data.state.attributes)
                        {
                            that.level = Number(data.state.attributes[that.level_attribute])
                        }
                    }
                    
                    state_text = ""
                    if ("state_text_attribute" in that.parameters)
                    {
                        state_text = data.state.attributes[that.parameters["state_text_attribute"]]
                    }
                    
                    if ("title_is_friendly_name" in that.parameters)
                    {
                        if ("friendly_name" in data.state.attributes)
                        {
                            that.ViewModel.title(data.state.attributes["friendly_name"])
                        }
                        else
                        {
                            that.ViewModel.title(that.widget_id)
                        }
                    }
                    
                    set_view(that, data.state, state_text)
                }
            }, "json");
        }
        else
        {
            new_view = {"state": that.state_active, "attributes": {}}
            new_view.attributes[that.level_attribute] = that.min_level
            set_view(this, new_view, "")
        }
    };
    
    function set_view(self, state, state_text)
    {
        if (state_text != "")
        {
            self.ViewModel.state_text(state_text)
        }
        if (state.state == self.state_active)
        {
            if ("icon_color_active" in parameters)
            {
                $('#' + widget_id + ' > h2').css("color", parameters["icon_color_active"])
            }
            else
            {
                if ("warn" in self.parameters && self.parameters["warn"] == 1)
                {
                    $('#' + widget_id + ' > h2').css("color", "")
                    self.ViewModel.icon_style("icon-active-warn")
                }
                else
                {
                    $('#' + widget_id + ' > h2').css("color", "")
                    self.ViewModel.icon_style("dimmer-icon-on")                
                }
                if (self.level_attribute == "state")
                {
                    level = state.state                   
                }
                else                
                {
                    level = state.attributes[self.level_attribute]
                }
                if (self.parameters.numeric)
                {
                    value = level
                }
                else
                {
                    value = Math.round((level - self.min_level)/(self.max_level - self.min_level)*100)
                }
                self.ViewModel.level(value)
            }
            self.ViewModel.icon(self.icon_on.split("-")[0] + ' ' + self.icon_on)
        }
        else
        {
            if ("icon_color_inactive" in parameters)
            {
                $('#' + widget_id + ' > h2').css("color", parameters["icon_color_inactive"])
            }
            else
            {
                $('#' + widget_id + ' > h2').css("color", "")
                self.ViewModel.icon_style("dimmer-icon-off")
            }
            self.ViewModel.icon(self.icon_off.split("-")[0] + ' ' + self.icon_off)
            if (parameters.inactive_level_valid)
            {
                if (self.level_attribute == "state")
                {
                    level = state.state                   
                }
                else                
                {
                    level = state.attributes[self.level_attribute]
                }
                if (self.parameters.numeric)
                {
                    value = level
                }
                else
                {
                    value = Math.round((level - self.min_level)/(self.max_level - self.min_level)*100)
                }
                self.ViewModel.level(value)
            }
            else
            {
                self.ViewModel.level(self.min_level)            
            }
        }
               
    }
}