var BetterSettingsTab = React.createClass({
    handleClick: function(e) {
        e.preventDefault();
        this.props.changeTab(this.props.tab.name);
    },
    render: function() {
        return (
            <div onClick={this.handleClick} className={this.props.currentTab === this.props.tab.name ? 'tab selected' : 'tab'}>{this.props.tab.name}</div>
        );
    }
});

var BetterSettingsTabContent = React.createClass({
    render: function() {
        var items = [];

        if (this.props.tab.items) {
            this.props.tab.items.forEach(function(item) {
                items.push(<BetterSettingsItem item={item} key={item.name} />);
            });
        }

        return (
            <div className={this.props.currentTab === this.props.tab.name ? 'tab-content active' : 'tab-content'}>
                <div className="tab-description">
                    {this.props.tab.description}
                </div>
                <ul>
                    {items}
                </ul>
            </div>
        );
    }
});

var BetterSettingsItem = React.createClass({
    getInitialState: function() {
        return {
            open: false
        }
    },
    expandItem: function() {
        this.setState({open: !this.state.open});
    },
    render: function() {
        var settings = [];

        if (this.props.item.settings) {
            this.props.item.settings.forEach(function(setting) {
                settings.push(<BetterSettingsSetting setting={setting} key={setting.name} />);
            });
        }

        return (
            <li className="item">
                <div className={this.state.open ? "pull no-select on" : "pull no-select"}><div className="visual"></div></div>
                <div className="item-title no-select" onClick={this.expandItem}>{this.props.item.name}</div>
                <BetterSettingsSwitch value={this.props.item.value === 'true'} />
                <div className={this.state.open ? "item-pull-down open" : "item-pull-down"}>
                    <div className="item-description">
                        {this.props.item.description}
                    </div>
                    {settings}
                </div>
            </li>
        );
    }
});

var BetterSettingsSwitch = React.createClass({
    getInitialState: function() {
        return {
            value: this.props.value
        }
    },
    flick: function() {
        this.setState({value: !this.state.value});
    },
    render: function() {
        return (
            <div onClick={this.flick} className={this.state.value ? 'switch no-select on' : 'switch no-select'}><div className="visual"><span className="on-text">ON</span><span className="off-text">OFF</span></div></div>
        );
    }
});

var BetterSettingsSetting = React.createClass({
    render: function() {
        var description;
        if (this.props.setting.description) {
            description = <div className="setting-description">{this.props.setting.description}</div>;
        }

        switch(this.props.setting.type) {
            case 'switch':
                return (
                    <div className="setting">
                        <div className="setting-title">{this.props.setting.name}</div>
                        <BetterSettingsSwitch value={this.props.setting.value === 'true'} />
                        {description}
                    </div>
                )
                break;
            case 'input':
                return (
                    <div className="setting">
                        <div className="setting-title">{this.props.setting.name}</div>
                        <input type="text" defaultValue={this.props.setting.value} />
                        {description}
                    </div>
                )
                break;
            case 'textarea':
                return (
                    <div className="setting">
                        <div className="setting-title">{this.props.setting.name}</div>
                        <textarea defaultValue={this.props.setting.value}></textarea>
                        {description}
                    </div>
                )
                break;
            case 'list':
                if (!$.isArray(this.props.setting.value)) {
                    return <span>error</span>;
                }
                var items = [];

                this.props.setting.value.forEach(function(item) {
                    items.push(<li>{item}<div className="remove no-select">&times;</div></li>);
                });

                return (
                    <div className="setting">
                        <div className="setting-title">{this.props.setting.name}</div>
                        <ul className="list-setting">
                            {items}
                        </ul>
                        <div className="list-setting-controls">
                            <div className="add no-select">+</div><input type="text" />
                        </div>
                        {description}
                    </div>
                )
                break;
        }
    }
});

var BetterSettings = React.createClass({
    getInitialState: function() {        
        return {
            currentTab: this.props.settings.tabs[0].name
        };
    },
    changeTab: function(tabName) {
        this.setState({currentTab: tabName});
    },
    render: function() {

        var tabs = [];
        var tabsContent = [];

        if (this.props.settings.tabs) {
            var _self = this;
            this.props.settings.tabs.forEach(function(tab) {
                tabs.push(<BetterSettingsTab tab={tab} changeTab={_self.changeTab} currentTab={_self.state.currentTab} key={tab.name} />);
                tabsContent.push(<BetterSettingsTabContent tab={tab} currentTab={_self.state.currentTab} key={tab.name} />);
            });
        }

        return (
            <div className="bttv-settings">

                <div className="tabs no-select">
                    {tabs}
                    <div className="close">&times;</div>
                </div>
                
                <div className="settings-footer">
                    <img src="img/mascot.png" style={{height: '50px', verticalAlign: 'middle'}} />
                </div>

                {tabsContent}
                
            </div>
        );
    }
});

ReactDOM.render(
    <BetterSettings settings={bttv.settings.generateTabs()} />,
    document.getElementById('bttv-settings')
);