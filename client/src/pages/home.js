import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import axios from 'axios';

// components
import Scream from '../components/Scream';

class home extends Component {
	state = {
		screams: []
	};
	componentDidMount() {
		axios
			.get('/screams')
			.then((res) => {
				console.log(res.data);
				this.setState({
					screams: res.data
				});
			})
			.catch((err) => {
				console.log('Error', err.code);
			});
	}

	render() {
		let recentScreamsMarkup = this.state.screams ? (
			this.state.screams.map((scream, id) => <Scream scream={scream} key={id} />)
		) : (
			<p>Loading...</p>
		);
		return (
			<Grid container>
				<Grid item sm={8} xs={12}>
					{recentScreamsMarkup}
				</Grid>
				<Grid item sm={4} xs={12}>
					<p>Profile...</p>
				</Grid>
			</Grid>
		);
	}
}

export default home;
