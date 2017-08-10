// Electron libs
const ipc = require('electron').ipcRenderer;

// React Libraries
import React, {Component} from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

// Redux
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as ActionCreators from '../actions/receipts.jsx';

// Custom Components
import Receipt from '../components/receipts/Receipt.jsx';
import EmptyMessage from '../components/shared/EmptyMessage.jsx';

// Component
class List extends Component {
  state = { openPrevWinHint: false };

  // Will Mount
  componentWillMount = () => {
    if (!this.props.receipts.loaded) {
      const {dispatch} = this.props;
      const getReceipts = bindActionCreators(
        ActionCreators.getReceipts,
        dispatch,
      );
      getReceipts();
    }
  };

  // Once Mounted, add event listeners
  // on opening and open preview window events
  componentDidMount = () => {
    // Opening Event
    ipc.on('show-opening-preview-window-hint', event => {
      this.setState({openPrevWinHint: true});
    });
    // Opened Event
    ipc.on('hide-opening-preview-window-hint', event => {
      this.setState({openPrevWinHint: false});
    });
  };

  // Remove all IPC listeners once all reciepts are removed
  // Or the container is unmounted
  componentWillUnmount() {
    ipc.removeAllListeners('confirmed-delete-receipt');
    ipc.removeAllListeners('show-opening-preview-window-hint');
    ipc.removeAllListeners('hide-opening-preview-window-hint');
  }

  // Delete a receipt
  deleteReceipt = id => {
    // Dispatch Action
    const {dispatch} = this.props;
    const deleteReceipt = bindActionCreators(
      ActionCreators.deleteReceipt,
      dispatch,
    );
    deleteReceipt(id);
  };

  // Render
  render = () => {
    const {receipts} = this.props;
    const receiptsComponent = receipts.data.map((receipt, index) => {
      return (
        <Receipt
          key={receipt._id}
          deleteReceipt={this.deleteReceipt}
          index={index}
          data={receipt}
        />
      );
    });
    return (
      <div className="pageWrapper">
        <div className="pageHeader">
          <h4>All Receipts</h4>
          <ReactCSSTransitionGroup
            transitionName="itemList"
            transitionEnterTimeout={500}
            transitionLeaveTimeout={300}>
            {this.state.openPrevWinHint &&
              <span className="pageHint rotating">
                <i className="ion-ios-loop-strong" />
              </span>}
          </ReactCSSTransitionGroup>
        </div>
        {receipts.data.length === 0
          ? <EmptyMessage text="You don't have any receipt yet"/>
          : <div className="pageContent">
              <div className="pageLabels">
                <div className="itemLabelNumner">
                  <label className="itemLabel">#</label>
                </div>
                <div className="itemLabelId">
                  <label className="itemLabel">Id</label>
                </div>
                <div className="itemLabelDate">
                  <label className="itemLabel ">Created Date</label>
                </div>
                <div className="itemLabelActions" />
              </div>
              {receiptsComponent}
            </div>}
      </div>
    );
  };
}

export default connect(state => ({
  receipts: state.ReceiptsReducer,
}))(List);
