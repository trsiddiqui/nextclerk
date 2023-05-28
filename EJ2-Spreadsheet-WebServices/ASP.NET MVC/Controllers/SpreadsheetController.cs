using Syncfusion.XlsIO;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Syncfusion.EJ2.Spreadsheet;
using System.Web;
using System.Web.Mvc;
using System.ServiceModel.Web;

namespace SSMVCWebAPI.Controllers
{
    [System.Web.Http.Route("api/[controller]")]
    public class SpreadsheetController : ApiController
    {
        [System.Web.Http.AcceptVerbs("Post")]
        [System.Web.Http.Route("api/Spreadsheet/Open")]
        [WebGet(BodyStyle = WebMessageBodyStyle.Bare)]
        public string Open()
        {
            OpenRequest openRequest = new OpenRequest();
            var file = HttpContext.Current.Request.Files[0];
            Stream stream = file.InputStream;  //initialise new stream
            byte[] inpBytes = new byte[file.InputStream.Length];  //declare arraysize
            stream.Read(inpBytes, 0, inpBytes.Length); // read from stream to byte array
            HttpPostedFileBase objFile = new HttpPostedFile(inpBytes, file.FileName);
            HttpPostedFileBase[] theFiles = new HttpPostedFileBase[1];
            theFiles[0] = objFile;
            openRequest.File = theFiles;
            return Workbook.Open(openRequest);
        }

        [System.Web.Http.Route("api/Spreadsheet/Save")]
        public void Save(SaveSettings saveSettings)
        {
            Workbook.Save(saveSettings);
        }
    }

    public class HttpPostedFile : HttpPostedFileBase
    {
        // convert the bytes[] to HttpPostedFileBase[]
        private readonly byte[] fileBytes;
        public HttpPostedFile(byte[] fileBytes, string fileName)
        {
            this.fileBytes = fileBytes;
            this.InputStream = new MemoryStream(fileBytes);
            this.FileName = fileName + ".xlsx";
        }
        public override int ContentLength => fileBytes.Length;
        public override string FileName { get; }
        public override Stream InputStream { get; }
    }
}
