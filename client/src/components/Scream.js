import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// MUI Stuff
import withStyles from '@material-ui/core/styles/withStyles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';

const styles = {
	card: {
		display: 'flex',
		marginBottom: 20
	},
	media: {
		minWidth: 200
	},
	content: {
		padding: 25
	}
};

class Scream extends Component {
	render() {
		dayjs.extend(relativeTime);
		const { classes, scream: { body, userImage, userhandle, likeCount, commentCount, createdAt } } = this.props;
		return (
			<Card className={classes.card}>
				<img src={userImage} alt="recipe thumbnail" />
				<CardContent className={classes.content}>
					<Typography variant="h5" component={Link} to={`users/${userhandle}`} color="primary">
						{userhandle}
					</Typography>
					<Typography variant="body2">{dayjs(createdAt).fromNow()}</Typography>
					<Typography variant="body1">{body}</Typography>
				</CardContent>
			</Card>
		);
	}
}

export default withStyles(styles)(Scream);
