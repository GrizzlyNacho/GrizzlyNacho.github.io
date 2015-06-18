define(function (require, exports, module) {
	var React = require("react");

	var TestMessage = React.createClass({
		render: function render() {
			return (<div>Hello Nate!</div>);
		}
	});
	
	React.render(<TestMessage/>, document.getElementById('reactRoot'));
});