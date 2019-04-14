import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { extract } from '@app/core';
import { Shell } from '@app/shell/shell.service';
import { VizComponent } from './viz.component';
import { ModuleImageComponent } from '@app/viz/module-image/module-image.component';
import { ModuleConvComponent } from '@app/viz/module-conv/module-conv.component';
import { ModuleDenseComponent } from '@app/viz/module-dense/module-dense.component';
import { ModulePoolComponent } from '@app/viz/module-pool/module-pool.component';

const routes: Routes = [
  Shell.childRoutes([
    {
      path: 'module_cnn',
      component: VizComponent,
      data: {
        title: extract(`What's a CNN?`)
      }
    },
    {
      path: 'module_image',
      component: ModuleImageComponent,
      data: {
        title: extract(`What's an image?`)
      }
    },
    {
      path: 'module_conv',
      component: ModuleConvComponent,
      data: {
        title: extract(`What is convolution?`)
      }
    },
    {
      path: 'module_pool',
      component: ModulePoolComponent,
      data: {
        title: extract(`What is pooling?`)
      }
    },
    {
      path: 'module_dense',
      component: ModuleDenseComponent,
      data: {
        title: extract(`What is a perceptron?`)
      }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class VizRoutingModule {}
