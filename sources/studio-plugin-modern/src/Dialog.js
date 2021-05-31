import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import Action from './Action';
import HistoryDialog from './HistoryDialog';
import DeleteDialog from './DeleteDialog';

import CookieUtil from './utils/cookie';

export default function ScrollDialog({ siteId, isOpen, handleClickOpen, handleClickClose }) {
  const [scroll, setScroll] = React.useState('paper');
  const [pages, setPages] = React.useState([]);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isOpenHistoryDialog, setIsOpenHistoryDialog] = React.useState(false);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState({});

  const handleActionClose = () => {
    setAnchorEl(null);
  };

  const retriveItem = (data, list) => {
    if (data && data.uri) {
      list.push({
        uri: data.uri,
        state: !!data.isLive ? 'Published' : 'Edited'
      });
    }
    if (data.children && data.children.length > 0) {
      for (let i = 0; i < data.children.length; i += 1) {
        retriveItem(data.children[i], list);
      }
    }
  };

  const fetchItem = (site, depth) => {
    const url = `${window.location.origin}/studio/api/1/services/api/1/content/get-items-tree.json?site=${site}&path=/site/website&depth=${depth}&order=default`;
    fetch(url)
    .then(response => response.json())
    .then((data) => {
      const list = [];
      retriveItem(data.item, list);
      setPages(list);
    });
  };

  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    if (isOpen) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
      fetchItem(siteId, 10);
    }
  }, [isOpen, siteId]);

  const onSelectItem = (event, elm) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(elm);
  };

  const showHistoryDialog = (event) => {
    setIsOpenHistoryDialog(true);
    setAnchorEl(null);
  };

  const showDeleteDialog = (event) => {
    setIsOpenDeleteDialog(true);
    setAnchorEl(null);
  };

  const handleDeleted = () => {
    fetchItem(siteId, 10);
    setIsOpenDeleteDialog(false);
  };

  const doPublish = () => {
    if (selectedItem.state === 'Published') {
      setAnchorEl(null);
      return;
    }

    const url = `${window.location.origin}/studio/api/1/services/api/1/workflow/go-live.json?site=${siteId}`;
    const data = {
      schedule: 'now',
      submissionComment: 'submission from plugin',
      publishChannel: 'live',
      items: [ selectedItem.uri ]
    };
    fetch(url, {
      headers: {
        'content-type': 'application/json; charset=UTF-8',
        'x-xsrf-token': CookieUtil.getCookie('XSRF-TOKEN'),
      },
      method: 'POST',
      body: JSON.stringify(data),
      credentials: 'include'
    })
    .then(response => response.json())
    .then((data) => {
      fetchItem(siteId, 10);
      setAnchorEl(null);
    });
  };

  return (
    <div>
      <Dialog
        fullWidth={true}
        open={isOpen}
        onClose={handleClickClose}
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <Action 
          anchorEl={anchorEl}
          handleClose={handleActionClose}
          doPublish={doPublish}
          showHistoryDialog={showHistoryDialog}
          showDeleteDialog={showDeleteDialog}
        />
        <HistoryDialog 
          siteId={siteId}
          filePath={selectedItem.uri}
          open={isOpenHistoryDialog}
          handleClose={() => setIsOpenHistoryDialog(false) }
        />
        <DeleteDialog
          siteId={siteId}
          filePath={selectedItem.uri}
          open={isOpenDeleteDialog}
          handleClose={() => setIsOpenDeleteDialog(false)}
          handleDeleted={handleDeleted}
        />
        <DialogTitle id="scroll-dialog-title">List Pages Site: <b>{siteId}</b></DialogTitle>
        <DialogContent dividers={scroll === 'paper'}>
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
          >
            {
              pages.map((elm) => (
                <ListItem key={elm.uri} button divider onClick={(event) => onSelectItem(event, elm)}>
                  <ListItemText
                    primary={`URI: ${elm.uri}`}
                    secondary={`State: ${elm.state}`}
                  />
                </ListItem>
              ))
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClickClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleClickClose} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}