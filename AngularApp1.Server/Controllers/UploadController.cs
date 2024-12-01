using Microsoft.AspNetCore.Mvc;
using MediaInfo.DotNetWrapper.Enumerations;
using MediaInfo.DotNetWrapper;
using System.IO;
using Microsoft.Extensions.Configuration.UserSecrets;
using System.Reflection;

namespace AngularApp1.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UploadController : ControllerBase
    {
        [HttpPost]
        [RequestSizeLimit(52428800)]
        public async Task<IActionResult> Upload(List<IFormFile> files)
        {
            //Если файлов нету возвращает ошибку
            if (files == null || files.Count == 0)
            {
                return BadRequest(new { message = "No files were uploaded." });
            }
            var fileDirectory = Path.Combine(Directory.GetCurrentDirectory(), "UploadedFiles");
            if (!Directory.Exists(fileDirectory))
            {
                Directory.CreateDirectory(fileDirectory);
            }

            //JSON файл для отображения у клиэнта
            var fileInfos = new List<object>();

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    //Путь Directory.GetCurrentDirectory() адресс сервера и папка UploadedFiles
                    var filePath = Path.Combine(Directory.GetCurrentDirectory(), "UploadedFiles", file.FileName);
                    //асинхронное создание файла
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }

                    var mediaInfo = GetMediaInfo(filePath);


                    fileInfos.Add(mediaInfo);
                }
            }
            Console.WriteLine(fileInfos);
            return Ok(fileInfos);
        }
        //Обращаеться к библиотеке MediaInfo и возвращает обьект с данными для вывода в json
        private object GetMediaInfo(string filePath)
        {
            using (var mediaInfo = new MediaInfo.DotNetWrapper.MediaInfo())
            {
                mediaInfo.Open(filePath);

                var duration = mediaInfo.Get(StreamKind.General, 0, "Duration");
                var fileSize = mediaInfo.Get(StreamKind.General, 0, "FileSize");
                var fileName = mediaInfo.Get(StreamKind.General, 0, "FileName");

                mediaInfo.Close();

                return new
                {
                    FileName = fileName,
                    FileSize = fileSize,
                    VideoDuration = Convert.ToDouble(duration) / 1000
                };
            }
        }
    }
}
