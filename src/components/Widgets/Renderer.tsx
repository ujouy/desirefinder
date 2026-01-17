import React from 'react';
import { Widget } from '../ChatWindow';

const Renderer = ({ widgets }: { widgets: Widget[] }) => {
  // No widgets for ecommerce agent - all queries should result in product searches
  return widgets.map((widget, index) => {
    return <div key={index}>Widget type not supported: {widget.widgetType}</div>;
  });
};

export default Renderer;
