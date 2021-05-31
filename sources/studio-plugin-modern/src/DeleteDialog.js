import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';

import CookieUtil from './utils/cookie';

export default function DeleteDialog({ open, handleClose, siteId, filePath, handleDeleted }) {
  const [dependentItems, setDependentItems] = React.useState([]);
  const [childItems, setChildItems] = React.useState([]);
  const [comment, setComment] = React.useState('');

  React.useEffect(() => {
    if (!siteId || !filePath || open) return;

    const url = `${window.location.origin}/studio/api/2/content/get_delete_package?siteId=${siteId}&paths=${filePath}`;
    fetch(url)
    .then(response => response.json())
    .then((data) => {
      if (data && data.items) {
        if (data.items.dependentItems) {
          setDependentItems(data.items.dependentItems);
        }

        if (data.items.childItems) {
          setChildItems(data.items.childItems);
        }
      }
    });
  }, [open, siteId, filePath]);

  const handleDeleteItems = (event) => {
    const url = `${window.location.origin}/studio/api/2/content/delete.json?siteId=${siteId}&paths=${filePath}&submissionComment=${comment}`;
    fetch(url, {
      headers: {
        'x-xsrf-token': CookieUtil.getCookie('XSRF-TOKEN'),
      },
      method: 'DELETE',
      credentials: 'include'
    })
    .then(response => response.json())
    .then((data) => {
      console.log(data);
      handleDeleted();
    });
  };

  return (
    <div>
      <Dialog 
        fullWidth={true}
        open={open} 
        onClose={handleClose} 
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Delete Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <h4>Delete Items</h4>
              <Typography gutterBottom>
                <div>{filePath}</div>
              </Typography>
            <h4>Child Items </h4>
            {
              childItems.map(item => (
                <Typography gutterBottom>
                  <div>{item}</div>
                </Typography>
              ))
            }
            <h4>Dependent Items</h4>
            {
              dependentItems.map(item => (
                <Typography gutterBottom>
                  <div>{item}</div>
                </Typography>
              ))
            }
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Comment"
            type="text"
            fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteItems} color="primary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}