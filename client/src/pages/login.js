import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AppIcon from '../images/twitter_icon.png';
import axios from 'axios';
import { Link } from 'react-router-dom';

// MUI Stuff
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = {
	form: {
		textAlign: 'center'
	},
	image: {
		width: 30,
		height: 30,
		margin: '20px auto 20px auto'
	},
	pageTitle: {
		margin: '10px auto 10px auto'
	},
	textField: {
		margin: '10px auto 10px auto'
	},
	button: {
		margin: '10px auto 10px auto',
		position: 'relative'
	},
	customError: {
		color: 'red',
		fontSize: '0.8rem',
		marginTop: 10
	},
	signup: {
		maginTop: 10
	},
	progress: {
		position: 'absolute'
	}
};
export class login extends Component {
	constructor() {
		super();
		this.state = {
			email: '',
			password: '',
			loading: false,
			errors: []
		};
	}

	handleSubmit = (e) => {
		e.preventDefault();
		this.setState({
			loading: true
		});
		const userData = {
			email: this.state.email,
			password: this.state.password
		};
		axios
			.post('/login', userData)
			.then((res) => {
				console.log(res.data);
				this.setState({
					loading: false
				});
				this.props.history.push('/');
			})
			.catch((err) => {
				this.setState({
					errors: err.response.data,
					loading: false
				});
			});
	};

	handleChange = (e) => {
		const { name, value } = e.target;
		this.setState({
			[name]: value
		});
	};

	render() {
		const { classes } = this.props;
		const { errors, loading } = this.state;

		return (
			<Grid container className={classes.form}>
				<Grid item sm />
				<Grid item sm>
					<img src={AppIcon} alt="twitter" className={classes.image} />
					<Typography variant="h5" className={classes.pageTitle}>
						Login
					</Typography>
					<form noValidate onSubmit={this.handleSubmit}>
						<TextField
							id="email"
							name="email"
							type="email"
							label="Email"
							value={this.state.email}
							onChange={this.handleChange}
							className={classes.textField}
							helperText={errors.email}
							error={errors.email ? true : false}
							fullWidth
						/>
						<TextField
							id="password"
							name="password"
							type="password"
							label="password"
							value={this.state.password}
							onChange={this.handleChange}
							className={classes.textField}
							helperText={errors.password}
							error={errors.password ? true : false}
							fullWidth
						/>
						{errors.general ? (
							<Typography variant="body2" className={classes.customError}>
								{errors.general}
							</Typography>
						) : null}
						<Button
							type="submit"
							variant="contained"
							color="primary"
							disabled={loading}
							className={classes.button}
						>
							Login
							{loading && <CircularProgress size={30} className={classes.progress} />}
						</Button>
						<br />
						<small className={classes.signup}>
							Don't have an account ? Please Signup <Link to="/signup">here</Link>
						</small>
					</form>
				</Grid>
				<Grid item sm />
			</Grid>
		);
	}
}

login.propTypes = {
	classes: PropTypes.object.isRequired
};

export default withStyles(styles)(login);
