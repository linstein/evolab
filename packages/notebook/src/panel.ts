// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { isMarkdownCellModel } from '@evolab/cells';

import { Kernel, KernelMessage, Session } from '@evolab/services';

import { each } from '@lumino/algorithm';

import { Token,UUID } from '@lumino/coreutils';

import * as nbformat from '@jupyterlab/nbformat';

import {
  ISessionContext,
  Printing,
  showDialog,
  Dialog
} from '@jupyterlab/apputils';

import { DocumentWidget, DocumentRegistry } from '@evolab/docregistry';

import { INotebookModel } from './model';

import { Notebook, StaticNotebook } from './widget';
import { PageConfig } from '@jupyterlab/coreutils';
import {Private} from "./actions";
import {CodeCell, MarkdownCell} from "../../cells/src";
// import {IExecuteReplyMsg} from "../../services/src/kernel/messages";

/**
 * The class name added to notebook panels.
 */
const NOTEBOOK_PANEL_CLASS = 'jp-NotebookPanel';

const NOTEBOOK_PANEL_TOOLBAR_CLASS = 'jp-NotebookPanel-toolbar';

const NOTEBOOK_PANEL_NOTEBOOK_CLASS = 'jp-NotebookPanel-notebook';

/**
 * A widget that hosts a notebook toolbar and content area.
 *
 * #### Notes
 * The widget keeps the document metadata in sync with the current
 * kernel on the context.
 */
export class NotebookPanel extends DocumentWidget<Notebook, INotebookModel> {
  /**
   * Construct a new notebook panel.
   */
  constructor(options: DocumentWidget.IOptions<Notebook, INotebookModel>) {
    super(options);

    // Set up CSS classes
    this.addClass(NOTEBOOK_PANEL_CLASS);
    this.toolbar.addClass(NOTEBOOK_PANEL_TOOLBAR_CLASS);
    this.content.addClass(NOTEBOOK_PANEL_NOTEBOOK_CLASS);

    // this.sessionContext.session!.kernel!._handleCommMsg=this.handlecomm;

    // Set up things related to the context
    this.content.model = this.context.model;
    this.context.sessionContext.kernelChanged.connect(
      this._onKernelChanged,
      this
    );
    this.context.sessionContext.statusChanged.connect(
      this._onSessionStatusChanged,
      this
    );

    this.cell_status={};
    this.lock_cells=[];
    this.comm=null;
    if(this.sessionContext.session !==null){
      console.log('session is not null');
      this.create_comm();

      this.sessionContext.session!.kernel!.exechandler.onExecMsg =async msg => {
        console.log("executer message5555555555555555555555555555");
        console.log(this.sessionContext.session!.kernel!.execute_cellid);
        const execid=this.sessionContext.session!.kernel!.execute_cellid[0];
        const exec_cell=this.content.widgets.find(x => x.model.metadata.get('id')!.toString() === execid) as CodeCell;
        console.log(exec_cell.model.id+"find codecell----------------+++++++++++");
        const model = exec_cell!.outputArea.model;
        const msgType = msg.header.msg_type;
        let output: nbformat.IOutput;
        switch (msgType) {
          case 'execute_result':
          case 'display_data':
          case 'stream':
          case 'error':
            output = { ...msg.content, output_type: msgType };
            model.add(output);
            break;
          case 'clear_output':
            const wait = (msg as KernelMessage.IClearOutputMsg).content.wait;
            model.clear(wait);
            break
          case "status":
            msg = msg as KernelMessage.IStatusMsg;
            if(msg.content.execution_state=="idle"){
              const count=this.sessionContext.session!.kernel!.count_cell[0];
              console.log("exec_count: "+count);
              exec_cell!.setPrompt(count);
              // @ts-ignore
              exec_cell!.header.node?.getElementsByTagName("text")[0].innerText="执行完毕";
              this.cell_status[execid]={"status":"endexec","start_time":Date.parse(msg.header.date)};
              this.sessionContext.session!.kernel!.count_cell.splice(0, 1);
              this.sessionContext.session!.kernel!.execute_cellid.splice(0, 1);
              // console.log(this.sessionContext.session!.kernel!.multi_runcell);
              if(this.sessionContext.session!.kernel!.execute_cellid.length===0){
                this.sessionContext.session!.kernel!.on_execute=false;
                var unexecell:CodeCell;
                for (var i = 0;i<this.sessionContext.session!.kernel!.multi_runcell.length;i++){
                  let cellidx=this.sessionContext.session!.kernel!.multi_runcell[i];
                  unexecell=this.content.widgets.find(x => x.model.metadata.get('id')!.toString() === cellidx) as CodeCell;
                  console.log("multi_runcell in search        "+cellidx);
                  console.log(unexecell.readOnly);
                  unexecell.readOnly=false;
                  // unexecell.editor.host.setAttribute('onclick','');
                  Object.assign(unexecell!.node.style, {background:'#87CEFA'});
                  unexecell.editor.host.style.background='#87CEFA';
                }
                this.sessionContext.session!.kernel!.multi_runcell.length=0;
                console.log(false);
                var kernelInfo=document.getElementById('kenelInfo_tool');
                // @ts-ignore
                kernelInfo!.getElementsByTagName("text")[0].innerText="空闲中";
                // @ts-ignore
                kernelInfo!.getElementsByTagName("img")[0].src='';
              }else{
                const next_cellid=this.sessionContext.session!.kernel!.execute_cellid[0];
                this.cell_status[next_cellid]={"status":"onexec","start_time":Date.parse(msg.header.date)};
                var next_cell=this.content.widgets.find(x => x.model.metadata.get('id')!.toString() === next_cellid) as CodeCell;
                // @ts-ignore
                next_cell!.header.node?.getElementsByTagName("text")[0].innerText="正在执行,已执行1分钟";

                var kernelInfo=document.getElementById('kenelInfo_tool');
                var cell_username=kernelInfo!.getElementsByTagName("text")[0].innerHTML.split(" ")[0];
                // @ts-ignore
                kernelInfo!.getElementsByTagName("text")[0].innerText=cell_username+" 执行cell,已运行1分钟，"+(this.sessionContext.session!.kernel!.execute_cellid.length-1).toString()+"个cell等待执行中";
              }
            }
            break
          case "execute_input":
            // const replycellid=msg.content.data.cellid!.toString();
            // @ts-ignore
            const exec_count=msg.content.execution_count!.toString();
            this.sessionContext.session!.kernel!.count_cell.push(exec_count);
            break
          // case "execute_reply":
          //   msg=msg as IExecuteReplyMsg;
          //   const exec_count=msg.content.execution_count!.toString();
          //   // const sendx={'cellid':exec_cell.model.metadata.get("id")!.toString(),"exec_count":exec_count,'func':'sync','spec':'exec_reply'};
          //   // this.comm!.send(sendx);
          //   this.sessionContext.session!.kernel!.execute_cellid.splice(0, 1);
          //   if(this.sessionContext.session!.kernel!.execute_cellid ==[]){
          //     this.sessionContext.session!.kernel!.on_execute=false
          //   }
          //   exec_cell!.setPrompt(exec_count);
          //   break;
          default:
            break;
        }
      }
    }

    this.content.dragcellMsg = (from, to) => {
      const sendx={'cellid':'',"from":from,"to":to,'func':'sync','spec':'drag_cell'};
      this.comm!.send(sendx)
    };
    this.content.focusMsg=(cellid,focus)=>{
      if(focus &&this.comm !==null){
        const sendx={'cellid':cellid,'func':'sync','spec':'lockcell',"username":this.getCookie("username"),"avatar":JSON.parse(this.getCookie("avatar"))};
        this.comm!.send(sendx);
      }else if(this.comm !==null) {
        const sendx={'cellid':cellid,'func':'sync','spec':'unlockcell'};
        this.comm!.send(sendx)
      }
    };

    this.context.saveState.connect(this._onSave, this);
    void this.revealed.then(() => {
      if (this.isDisposed) {
        // this widget has already been disposed, bail
        return;
      }

      // Set the document edit mode on initial open if it looks like a new document.
      if (this.content.widgets.length === 1) {
        const cellModel = this.content.widgets[0].model;
        if (cellModel.type === 'code' && cellModel.value.text === '') {
          this.content.mode = 'edit';
        }
      }
    });

    window.setInterval(()=>{
      if(this.content !=null){
          var now_time=Date.now();
          for (let cell_id in this.cell_status){
            let cell_update= this.content.widgets.find(x => x.model.metadata.get('id')!.toString() === cell_id);
            let start_time=this.cell_status[cell_id]["start_time"] as number;
            let timediff=(now_time-start_time)/1000;
            let minutes = String(parseInt(String(timediff % 3600 / 60))+1);
            let hours = String(parseInt(String(timediff / 3600)));
            if(this.sessionContext.session!.kernel!.on_execute){
              var kernelInfo=document.getElementById('kenelInfo_tool');
              var cell_username=kernelInfo!.getElementsByTagName("text")[0].innerHTML.split(" ")[0];
              // @ts-ignore
              kernelInfo!.getElementsByTagName("text")[0].innerText=cell_username+" 执行cell,已运行"+minutes+"分钟，"+(this.sessionContext.session!.kernel!.execute_cellid.length-1).toString()+"个cell等待执行中";
            }

            let status=this.cell_status[cell_id]["status"];
            if(cell_update !== null){
              switch (status) {
                case "endedit":
                  if(hours=="0"){
                    // @ts-ignore
                    cell_update!.header.node.getElementsByTagName("text")[0].innerText=minutes+"分钟前编辑";
                  }else{
                    // @ts-ignore
                    cell_update!.header.node.getElementsByTagName("text")[0].innerText=hours+"小时"+minutes+"分钟前编辑";
                  }
                  break
                case "onedit":
                  if(hours=="0"){
                    // @ts-ignore
                    cell_update!.header.node.getElementsByTagName("text")[0].innerText="正在编辑,已编辑"+minutes+"分钟";
                  }else{
                    // @ts-ignore
                    cell_update!.header.node.getElementsByTagName("text")[0].innerText="正在编辑,已编辑"+hours+"小时"+minutes+"分钟";
                  }
                  break
                case "onexec":
                  if(hours=="0"){
                    // @ts-ignore
                    cell_update!.header.node.getElementsByTagName("text")[0].innerText="正在执行,已执行"+minutes+"分钟";
                  }else{
                    // @ts-ignore
                    cell_update!.header.node.getElementsByTagName("text")[0].innerText="正在执行,已执行"+hours+"小时"+minutes+"分钟";
                  }
                  break
                case "endexec":
                  if(hours=="0"){
                    // @ts-ignore
                    cell_update!.header.node.getElementsByTagName("text")[0].innerText=minutes+"分钟前执行";
                  }else{
                    // @ts-ignore
                    cell_update!.header.node.getElementsByTagName("text")[0].innerText=hours+"小时"+minutes+"分钟前执行";
                  }
                  break
              }
            }

          }
      }
    },10000)
  }

  public comm:Kernel.IComm |null;
  private lock_cells:string[];
  public  cell_status:{[key: string]: {[key: string]: string|number;};};

  getCookie(cname: string): string {
    const name = cname + "=";
    const ca = document.cookie.split(';');
    let i = 0;
    for (i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
  }

  private create_comm(){
      console.log('createcomm msg!!!!!!!!!!!!!!!!!!!!!!!!');
      if (this.comm===null && this.sessionContext.session!==null){
        if(!this.sessionContext.session!.kernel){
          throw new Error('Session has no kernel.');
        }
        const comm_id= UUID.uuid4();
        this.sessionContext.session!.kernel!._commid=comm_id;
        this.comm = this.sessionContext.session!.kernel!.createComm('test1',comm_id);
        this.comm.open();
        this.comm.onMsg = async msg => {
          console.log("handle comm_msg....................");
          const cellid=msg.content.data.cellid!.toString();
          // console.log(msg.content.data.cellid);
          // console.log(this._cellModel!.value.text);
          const specs=msg.content.data.spec;
          switch (specs) {
            case "createcell":
              let celltype=msg.content.data.celltype;
              if(celltype=="code"){
                const cellcreate = this.content.model!.contentFactory.createCell(
                "code",
                {'id':cellid!.toString()}
                );
                this.content.model!.cells.insert(+msg.content.data.index!, cellcreate);
              }else {
                const cellcreate = this.content.model!.contentFactory.createCell(
                "markdown",
                {'id':cellid!.toString()}
                );
                this.content.model!.cells.insert(+msg.content.data.index!, cellcreate);
              }
              this.content.activeCellIndex++;
              this.content.deselectAll();
              break;
            case "deletecell":
              const indexs=msg.content.data.indexs!.toString().split(",");
              indexs.reverse().forEach(index => {
                this.content.model!.cells.remove(+index);
              });
              // this.content.model!.cells.remove(index);
              break;
            // case "exec_reply":
            //   const replycellid=this.sessionContext.session!.kernel!.count_cellid[0];
            //   // const replycellid=msg.content.data.cellid!.toString();
            //   const exec_count=msg.content.data.execution_count!.toString();
            //   const replycell=this.content.widgets.find(x => x.model.metadata.get('id')!.toString() === replycellid) as CodeCell;
            //   console.log("exec_count: "+exec_count);
            //   replycell!.setPrompt(exec_count);
            //   this.sessionContext.session!.kernel!.count_cellid.splice(0, 1);
            //   break;
            case "executecell":
              console.log("handle sync executecell8888888888888888888");
              this.sessionContext.session!.kernel!.on_execute=true;
              this.sessionContext.session!.kernel!.execute_cellid.push(cellid);
              this.sessionContext.session!.kernel!.multi_runcell.push(cellid);
              const cellec=this.content.widgets.find(x => x.model.metadata.get('id')!.toString() === cellid) as CodeCell;
              cellec.readOnly=true;
              cellec!.setPrompt('*');
              cellec.outputArea.model.clear();
              cellec.editor.host.setAttribute('disabled','true');
              Object.assign(cellec!.node.style, {background:'#F7EED6'});
              cellec.editor.host.style.background='#F7EED6';

              var cell_useravatar=msg.content.data.avatar!.toString();
              var cell_username=msg.content.data.user!.toString();

              var kernelInfo=document.getElementById('kenelInfo_tool');
              // @ts-ignore
              kernelInfo!.getElementsByTagName("text")[0].innerText=cell_username+" 执行cell,已运行1分钟，"+(this.sessionContext.session!.kernel!.execute_cellid.length-1).toString()+"个cell等待执行中";
              // @ts-ignore
              kernelInfo!.getElementsByTagName("img")[0].src=cell_useravatar;


              cellec!.header.node.innerText='';
              var a=document.createElement("text");
              var img=document.createElement("img");
              img.src=cell_useravatar;
              if(this.sessionContext.session!.kernel!.execute_cellid.length==1){
                a.innerText="正在执行,已执行1分钟";
                this.cell_status[cellid]={"status":"onexec","start_time":Date.parse(msg.header.date)};
              }else{
                a.innerText="等待执行";
                this.cell_status[cellid]={"status":"waitexec","start_time":Date.parse(msg.header.date)};
              }
              Object.assign(cellec!.header.node.style, {height:"30px","display":'block'});
              Object.assign(a.style, {float:"right"});
              Object.assign(img.style, {float:"right", "border-radius":"80%", "height": "30px", "overflow":"hidden"});
              cellec!.header.node.appendChild(img);
              cellec!.header.node.appendChild(a);
              break;
            case "rendermdcell":
              const mdcell=this.content.widgets.find(x => x.model.metadata.get('id')!.toString() === cellid) as MarkdownCell;
              mdcell.rendered = true;
              mdcell.inputHidden = false;
              break;
            case "lockcell":
              if(this.lock_cells.indexOf(cellid)===-1){
                const lockcell=this.content.widgets.find(x => x.model.metadata.get('id')!.toString() === cellid) as CodeCell;
                if(this.sessionContext.session!.kernel!._commid !== msg.content.comm_id){
                  console.log(this.lock_cells);
                  // var cell_username=msg.content.data.username;
                  lockcell!.readOnly=true;
                  Object.assign(lockcell!.node.style, {background:'#808080'});
                  lockcell.editor.host.style.background='#808080';
                  lockcell!.editor.host.setAttribute('disabled','true');
                  this.lock_cells.push(cellid);
                  console.log('change lockcell color!!!!!')
                }else{
                  Object.assign(lockcell!.node.style, {background:''});
                  lockcell.editor.host.style.background='';
                }

                // lockcell!.editor.host.style.background='';
                this.cell_status[cellid]={"status":"onedit","start_time":Date.parse(msg.header.date)};
                console.log('kaishi111111111111111');
                var cell_useravatar1=msg.content.data.avatar!.toString();
                console.log(cell_useravatar1);
                lockcell!.header.node.innerText='';
                var a1=document.createElement("text");
                var img1=document.createElement("img");
                img1.src=cell_useravatar1;
                a1.innerText="正在编辑,已编辑1分钟";
                console.log('kaishi2222222222222222')
                Object.assign(lockcell!.header.node.style, {height:"30px","display":'block'});
                Object.assign(a1.style, {float:"right"});
                Object.assign(img1.style, {float:"right", "border-radius":"80%", "height": "30px", "overflow":"hidden"});
                lockcell!.header.node.appendChild(img1);
                lockcell!.header.node.appendChild(a1);
                console.log("添加正在编辑信息");
              }
              break;
            case "unlockcell":
              if(this.lock_cells.indexOf(cellid)!==-1){
                console.log(this.lock_cells);
                const unlockcell=this.content.widgets.find(x => x.model.metadata.get('id')!.toString() === cellid);
                if(this.sessionContext.session!.kernel!._commid !== msg.content.comm_id){
                  const pos=this.lock_cells.indexOf(cellid);
                  this.lock_cells.splice(pos,1);
                  unlockcell!.readOnly=false;
                  unlockcell!.editor.host.setAttribute('onclick','');
                  Object.assign(unlockcell!.node.style, {background:''});
                  unlockcell!.editor.host.style.background='';
                }
              }
              if(this.cell_status[cellid]["status"] !== "onexec" &&this.cell_status[cellid]["status"] !== "waitexec" ){
                this.cell_status[cellid]={"status":"endedit","start_time":Date.parse(msg.header.date)};
                const unlockcell=this.content.widgets.find(x => x.model.metadata.get('id')!.toString() === cellid);
                // @ts-ignore
                unlockcell!.header.node?.getElementsByTagName("text")[0].innerText="1分钟前编辑"
              }
              break;
            case "celltype":
              Private.changecelltypebyid(this.content,msg.content.data.celltype!.toString(),msg.content.data.cellid!.toString(),+msg.content.data.index!);
              break;

            case "txt":
              const celltxt=this.content.widgets.find(x => x.model.metadata.get('id')!.toString() === cellid);
              if(celltxt) {
                console.log('find cell by id !!!!!!!!!!!!!!');
                celltxt!.model.value.text = msg.content.data.txt!.toString();
              }
              break;
            case "drag_cell":
              const from=+msg.content.data.from!;
              const to=+msg.content.data.to!;
              this.content.model?.cells.move(from,to);
              break;

            default:
              break
          }
        };
      }else{
        return
      }
    }

  _onSave(sender: DocumentRegistry.Context, state: DocumentRegistry.SaveState) {
    if (state === 'started' && this.model) {
      // Find markdown cells
      const { cells } = this.model;
      each(cells, cell => {
        if (isMarkdownCellModel(cell)) {
          for (const key of cell.attachments.keys) {
            if (!cell.value.text.includes(key)) {
              cell.attachments.remove(key);
            }
          }
        }
      });
    }
  }

  // async handlecomm(msg: KernelMessage.ICommMsgMsg): Promise<void> {
  //   console.log(msg)
  // }

  /**
   * The session context used by the panel.
   */
  //获取sessionContext进而得到kernel
  get sessionContext(): ISessionContext {
    return this.context.sessionContext;
  }

  /**
   * The notebook used by the widget.
   */
  readonly content: Notebook;

  /**
   * The model for the widget.
   */
  get model(): INotebookModel | null {
    return this.content.model;
  }

  /**
   * Update the options for the current notebook panel.
   *
   * @param config new options to set
   */
  setConfig(config: NotebookPanel.IConfig): void {
    this.content.editorConfig = config.editorConfig;
    this.content.notebookConfig = config.notebookConfig;
    // Update kernel shutdown behavior
    const kernelPreference = this.context.sessionContext.kernelPreference;
    this.context.sessionContext.kernelPreference = {
      ...kernelPreference,
      shutdownOnDispose: config.kernelShutdown
    };
  }

  /**
   * Set URI fragment identifier.
   */
  setFragment(fragment: string) {
    void this.context.ready.then(() => {
      this.content.setFragment(fragment);
    });
  }

  /**
   * Dispose of the resources used by the widget.
   */
  dispose(): void {
    if(!this.comm){
      this.comm!.close();
    }
    this.content.dispose();
    super.dispose();
  }

  /**
   * Prints the notebook by converting to HTML with nbconvert.
   */
  [Printing.symbol]() {
    return async () => {
      // Save before generating HTML
      if (this.context.model.dirty && !this.context.model.readOnly) {
        await this.context.save();
      }

      await Printing.printURL(
        PageConfig.getNBConvertURL({
          format: 'html',
          download: false,
          path: this.context.path
        })
      );
    };
  }

  /**
   * Handle a change in the kernel by updating the document metadata.
   */
  private _onKernelChanged(
    sender: any,
    args: Session.ISessionConnection.IKernelChangedArgs
  ): void {
    if (!this.model || !args.newValue) {
      return;
    }
    const { newValue } = args;
    void newValue.info.then(info => {
      if (
        this.model &&
        this.context.sessionContext.session?.kernel === newValue
      ) {
        this._updateLanguage(info.language_info);
      }
    });
    void this._updateSpec(newValue);
    if(this.comm !==null && !this.comm.isDisposed && !this.sessionContext.session!.kernel!.isDisposed){
      this.comm!.close();
    }
    this.comm=null;
    this.create_comm();
    this.sessionContext.session!.kernel!.exechandler.onExecMsg =async msg => {
        console.log("executer message5555555555555555555555555555");
        console.log(this.sessionContext.session!.kernel!.execute_cellid);
        const execid=this.sessionContext.session!.kernel!.execute_cellid[0];
        const exec_cell=this.content.widgets.find(x => x.model.metadata.get('id')!.toString() === execid) as CodeCell;
        console.log(exec_cell.model.id+"find codecell----------------+++++++++++");
        const model = exec_cell!.outputArea.model;
        const msgType = msg.header.msg_type;
        let output: nbformat.IOutput;
        switch (msgType) {
          case 'execute_result':
          case 'display_data':
          case 'stream':
          case 'error':
            output = { ...msg.content, output_type: msgType };
            model.add(output);
            break;
          case 'clear_output':
            const wait = (msg as KernelMessage.IClearOutputMsg).content.wait;
            model.clear(wait);
            break;
          case "status":
            msg = msg as KernelMessage.IStatusMsg;
            if(msg.content.execution_state=="idle"){
              const count=this.sessionContext.session!.kernel!.count_cell[0];
              console.log("exec_count: "+count);
              exec_cell!.setPrompt(count);
              // @ts-ignore
              exec_cell!.header.node?.getElementsByTagName("text")[0].innerText="执行完毕";
              this.cell_status[execid]={"status":"endexec","start_time":Date.parse(msg.header.date)};
              this.sessionContext.session!.kernel!.count_cell.splice(0, 1);
              this.sessionContext.session!.kernel!.execute_cellid.splice(0, 1);
              // console.log(this.sessionContext.session!.kernel!.multi_runcell);
              if(this.sessionContext.session!.kernel!.execute_cellid.length===0){
                this.sessionContext.session!.kernel!.on_execute=false;
                var unexecell:CodeCell;
                for (var i = 0;i<this.sessionContext.session!.kernel!.multi_runcell.length;i++){
                  let cellidx=this.sessionContext.session!.kernel!.multi_runcell[i];
                  unexecell=this.content.widgets.find(x => x.model.metadata.get('id')!.toString() === cellidx) as CodeCell;
                  console.log("multi_runcell in search        "+cellidx);
                  console.log(unexecell.readOnly);
                  unexecell.readOnly=false;
                  // unexecell.editor.host.setAttribute('onclick','');
                  Object.assign(unexecell!.node.style, {background:'#87CEFA'});
                  unexecell.editor.host.style.background='#87CEFA';
                }
                this.sessionContext.session!.kernel!.multi_runcell.length=0;
                console.log(false);
                var kernelInfo=document.getElementById('kenelInfo_tool');
                // @ts-ignore
                kernelInfo!.getElementsByTagName("text")[0].innerText="空闲中";
                // @ts-ignore
                kernelInfo!.getElementsByTagName("img")[0].src='';

              }else{
                const next_cellid=this.sessionContext.session!.kernel!.execute_cellid[0];
                this.cell_status[next_cellid]={"status":"onexec","start_time":Date.parse(msg.header.date)};
                var next_cell=this.content.widgets.find(x => x.model.metadata.get('id')!.toString() === next_cellid) as CodeCell;
                // @ts-ignore
                next_cell!.header.node?.getElementsByTagName("text")[0].innerText="正在执行,已执行1分钟";

                var kernelInfo=document.getElementById('kenelInfo_tool');
                var cell_username=kernelInfo!.getElementsByTagName("text")[0].innerHTML.split(" ")[0];
                // @ts-ignore
                kernelInfo!.getElementsByTagName("text")[0].innerText=cell_username+" 执行cell,已运行1分钟，"+(this.sessionContext.session!.kernel!.execute_cellid.length-1).toString()+"个cell等待执行中";
              }
            }
            break
          case "execute_input":
            // const replycellid=msg.content.data.cellid!.toString();
            // @ts-ignore
            const exec_count=msg.content.execution_count!.toString();
            this.sessionContext.session!.kernel!.count_cell.push(exec_count);
            break
          // case "execute_reply":
          //   msg=msg as IExecuteReplyMsg;
          //   const exec_count=msg.content.execution_count!.toString();
          //     // const sendx={'cellid':exec_cell.model.metadata.get("id")!.toString(),"exec_count":exec_count,'func':'sync','spec':'exec_reply'};
          //     // this.comm!.send(sendx);
          //   this.sessionContext.session!.kernel!.execute_cellid.splice(0, 1);
          //   if(this.sessionContext.session!.kernel!.execute_cellid ==[]){
          //     this.sessionContext.session!.kernel!.on_execute=false
          //   }
          //   exec_cell!.setPrompt(exec_count);
          //   break;
          default:
            break;
        }
      };
    this.content.dragcellMsg = (from, to) => {
      const sendx={'cellid':'',"from":from,"to":to,'func':'sync','spec':'drag_cell'};
      this.comm!.send(sendx)
    };
    this.content.focusMsg=(cellid,focus)=>{
      if(focus){
        const sendx={'cellid':cellid,'func':'sync','spec':'lockcell',"username":this.getCookie("username"),"avatar":JSON.parse(this.getCookie("avatar"))};
        this.comm!.send(sendx)
      }else {
        const sendx={'cellid':cellid,'func':'sync','spec':'unlockcell'};
        this.comm!.send(sendx)
      }

    };
  }

  private _onSessionStatusChanged(
    sender: ISessionContext,
    status: Kernel.Status
  ) {
    // If the status is autorestarting, and we aren't already in a series of
    // autorestarts, show the dialog.
    if (status === 'autorestarting' && !this._autorestarting) {
      // The kernel died and the server is restarting it. We notify the user so
      // they know why their kernel state is gone.
      void showDialog({
        title: 'Kernel Restarting',
        body: `The kernel for ${this.sessionContext.session?.path} appears to have died. It will restart automatically.`,
        buttons: [Dialog.okButton()]
      });
      this._autorestarting = true;
    } else if (status === 'restarting') {
      // Another autorestart attempt will first change the status to
      // restarting, then to autorestarting again, so we don't reset the
      // autorestarting status if the status is 'restarting'.
      /* no-op */
    } else {
      this._autorestarting = false;
    }
  }

  /**
   * Update the kernel language.
   */
  private _updateLanguage(language: KernelMessage.ILanguageInfo): void {
    this.model!.metadata.set('language_info', language);
  }

  /**
   * Update the kernel spec.
   */
  private async _updateSpec(kernel: Kernel.IKernelConnection): Promise<void> {
    const spec = await kernel.spec;
    if (this.isDisposed) {
      return;
    }
    this.model!.metadata.set('kernelspec', {
      name: kernel.name,
      display_name: spec?.display_name,
      language: spec?.language
    });
  }

  /**
   * Whether we are currently in a series of autorestarts we have already
   * notified the user about.
   */
  private _autorestarting = false;
}

/**
 * A namespace for `NotebookPanel` statics.
 */
export namespace NotebookPanel {
  /**
   * Notebook config interface for NotebookPanel
   */
  export interface IConfig {
    /**
     * A config object for cell editors
     */
    editorConfig: StaticNotebook.IEditorConfig;
    /**
     * A config object for notebook widget
     */
    notebookConfig: StaticNotebook.INotebookConfig;
    /**
     * Whether to shut down the kernel when closing the panel or not
     */
    kernelShutdown: boolean;
  }

  /**
   * A content factory interface for NotebookPanel.
   */
  export interface IContentFactory extends Notebook.IContentFactory {
    /**
     * Create a new content area for the panel.
     */
    createNotebook(options: Notebook.IOptions): Notebook;
  }

  /**
   * The default implementation of an `IContentFactory`.
   */
  export class ContentFactory extends Notebook.ContentFactory
    implements IContentFactory {
    /**
     * Create a new content area for the panel.
     */
    createNotebook(options: Notebook.IOptions): Notebook {
      return new Notebook(options);
    }
  }

  /**
   * Default content factory for the notebook panel.
   */
  export const defaultContentFactory: ContentFactory = new ContentFactory();

  /* tslint:disable */
  /**
   * The notebook renderer token.
   */
  export const IContentFactory = new Token<IContentFactory>(
    '@evolab/notebook:IContentFactory'
  );
  /* tslint:enable */
}
