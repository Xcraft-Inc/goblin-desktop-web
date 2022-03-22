import React from 'react';
import Widget from 'goblin-laboratory/widgets/widget';
import Desktop from 'goblin-desktop/widgets/desktop/widget';
import WithDesktopId from 'goblin-laboratory/widgets/with-desktop-id/widget';
/******************************************************************************/

class DesktopWebRoot extends Widget {
  constructor() {
    super(...arguments);
  }

  render() {
    return (
      <WithDesktopId desktopId={this.props.id}>
        <Desktop id={this.props.id} />
      </WithDesktopId>
    );
  }
}

export default DesktopWebRoot;
